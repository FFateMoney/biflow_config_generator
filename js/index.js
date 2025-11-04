Chart.ready(() => {
  let currentNode = null;
  let nodeCounter = 1;

  const portUuid = (id, type) => `${id}:${type}`;

  const chart = new Chart($('#js-chart'), {
    onNodeClick(data) {
      currentNode = data;
      showNodeConfig(data);
    }
  });

  const AUTO_LAYOUT = {
    BASE_X: 360,
    BASE_Y: 160,
    COLUMN_GAP: 260,
    ROW_GAP: 240
  };

  const $canvas = $("#js-chart");
  const $viewport = $(".middle");
  const MIN_SCALE = 0.2;
  const MAX_SCALE = 3;
  const GRID_BASE_SIZE = 40;
  let panX = 0;
  let panY = 0;
  let scale = 1;
  let isPanning = false;
  let lastPointer = { x: 0, y: 0 };

  function updateViewportGrid() {
    const scaledSize = GRID_BASE_SIZE * scale || GRID_BASE_SIZE;
    const wrap = (value) => {
      const size = scaledSize || GRID_BASE_SIZE;
      const mod = ((value % size) + size) % size;
      return `${mod}px`;
    };
    $viewport.css("--grid-scale", scale);
    $viewport.css("--grid-offset-x", wrap(-panX));
    $viewport.css("--grid-offset-y", wrap(-panY));
  }

  function applyViewportTransform() {
    $canvas.css("transform", `translate(${panX}px, ${panY}px) scale(${scale})`);
    if (chart && chart._jsPlumb) {
      chart._jsPlumb.setZoom(scale);
    }
    updateViewportGrid();
  }

  function resetViewport() {
    panX = 0;
    panY = 0;
    scale = 1;
    applyViewportTransform();
  }

  resetViewport();

  $viewport.on("mousedown", (event) => {
    if (event.button !== 0) return;
    const $target = $(event.target);
    if ($target.closest(".task").length) return;
    if ($target.closest(".global-config").length) return;
    isPanning = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    $viewport.addClass("panning");
    event.preventDefault();
  });

  $(window)
    .on("mousemove", (event) => {
      if (!isPanning) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      panX += dx;
      panY += dy;
      lastPointer = { x: event.clientX, y: event.clientY };
      applyViewportTransform();
      event.preventDefault();
    })
    .on("mouseup", () => {
      if (!isPanning) return;
      isPanning = false;
      $viewport.removeClass("panning");
    })
    .on("mouseleave", () => {
      if (!isPanning) return;
      isPanning = false;
      $viewport.removeClass("panning");
    });

  $viewport.on("wheel", (event) => {
    const original = event.originalEvent;
    if (!original || typeof original.deltaY === "undefined") return;
    event.preventDefault();
    const zoomFactor = original.deltaY < 0 ? 1.1 : 0.9;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * zoomFactor));
    if (nextScale === scale) return;
    const rect = $viewport[0].getBoundingClientRect();
    const pivotX = original.clientX - rect.left;
    const pivotY = original.clientY - rect.top;
    panX = pivotX - ((pivotX - panX) * nextScale) / scale;
    panY = pivotY - ((pivotY - panY) * nextScale) / scale;
    scale = nextScale;
    applyViewportTransform();
  });

  // Left list: render + filter
  function renderPredefinedNodes() {
    const selectedTool = $("#tool-filter").length ? ($("#tool-filter").val() || "") : "";
    let html = "";
    (window.PREDEFINED_NODES || []).forEach((node, idx) => {
      if (selectedTool && node.tool !== selectedTool) return;
      html += '<li>' +
        '<div><strong>tool:</strong> <span class="node-tool-display" data-idx="' + idx + '">' + (node.tool || '') + '</span></div>' +
        '<div><strong>subcommand:</strong> <span class="node-subcommand-display" data-idx="' + idx + '">' + (node.subcommand || '') + '</span></div>' +
        '<a class="btn-add" href="javascript:void(0)" data-idx="' + idx + '"><div class="iconfont icon-tianjia"></div></a>' +
      '</li>';
    });
    $(".nodes").html(html);
  }

  function renderToolFilter() {
    if (!$("#tool-filter").length) return;
    const tools = Array.from(new Set(((window.PREDEFINED_NODES || []).map(n => n.tool)).filter(Boolean))).sort();
    const options = ["<option value=\"\">\u5168\u90e8\u5de5\u5177</option>"]
      .concat(tools.map(t => `<option value="${t}">${t}</option>`)).join("");
    $("#tool-filter").html(options);
  }

  function bindToolFilterEvents() {
    if (!$("#tool-filter").length) return;
    $("#tool-filter").off("change").on("change", function() {
      renderPredefinedNodes();
    });
  }

  // Add node from predefined list
  function bindPredefinedEvents() {
    $(".nodes").on("click", ".btn-add", function () {
      const idx = $(this).data("idx");
      const nodeData = (window.PREDEFINED_NODES || [])[idx] || {};
      const nodeName = nodeData.subcommand ? `${nodeData.tool} (${nodeData.subcommand})` : (nodeData.tool || 'New Node');
      const nodeId = nodeCounter++;
      const newNode = chart.addNode(nodeName, 100, 100, {
        id: nodeId,
        class: 'node-process',
        data: {
          nodeId: nodeId,
          name: nodeName,
          tool: nodeData.tool || 'New Node',
          subcommand: nodeData.subcommand || '',
          input_dir: { ...(nodeData.input_dir || {}) },
          output_dir: nodeData.output_dir || '',
          params: { ...(nodeData.params || {}) }
        }
      });
      newNode.addPort({ isSource: true, uuid: portUuid(nodeId, 'source') });
      newNode.addPort({ isTarget: true, position: 'Top', uuid: portUuid(nodeId, 'target') });
    });
  }

  // Right panel
  function showNodeConfig(data) {
    const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    $('.proc-name').text(data.name || '');
    $('.field-tool').val(data.tool || '').prop('readonly', true);
    $('.field-subcommand').val(data.subcommand || '').prop('readonly', true);
    $('.field-output').val(data.output_dir || '');
    const inputFields = Object.entries(data.input_dir || {}).map(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
      const friendlyKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return '<div class="input-field">' +
        `<label>${friendlyKey}:</label>` +
        `<input type="text" data-key="${key}" value="${esc(displayValue)}" class="field-input-dir" placeholder="\u8f93\u5165 ${friendlyKey} \u7684\u503c">` +
      '</div>';
    }).join('');
    $('.input-dir-fields').html(inputFields || '<div>\u65e0\u8f93\u5165\u76ee\u5f55\u914d\u7f6e</div>');

    const paramFields = Object.entries(data.params || {}).map(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
      const friendlyKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return '<div class="param-field">' +
        `<label>${friendlyKey}:</label>` +
        `<input type="text" data-key="${key}" value="${esc(displayValue)}" class="field-param" placeholder="\u8f93\u5165 ${friendlyKey} \u7684\u503c">` +
      '</div>';
    }).join('');
    $('.params-fields').html(paramFields || '<div>\u65e0\u53c2\u6570\u914d\u7f6e</div>');
  }

  // Save props
  $('.btn-save-prop').click(() => {
    if (!currentNode) return;
    currentNode.output_dir = $('.field-output').val();
    currentNode.input_dir = {};
    $('.input-dir-fields .field-input-dir').each(function(){
      const key = $(this).data('key');
      const value = $(this).val();
      try { currentNode.input_dir[key] = JSON.parse(value); } catch { currentNode.input_dir[key] = value; }
    });
    currentNode.params = {};
    $('.params-fields .field-param').each(function(){
      const key = $(this).data('key');
      const value = $(this).val();
      try { currentNode.params[key] = JSON.parse(value); } catch { currentNode.params[key] = value; }
    });
    alert('\u5c5e\u6027\u4fdd\u5b58\u6210\u529f\uff01');
  });
  $('.btn-reset-prop').click(() => { if (currentNode) showNodeConfig(currentNode); });

  // Export YAML
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function readFile(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsText(file); }); }

  $('#btn-save-yaml').click(() => {
    const flowName = $('#global-flow-name').val().trim() || 'flow';
    const global = { flow_name: flowName, parallelize: $('#global-parallelize').val(), log_dir: $('#global-log-dir').val() };
    const allNodes = chart.getNodes();
    allNodes.forEach(n => n.updatePos());
    const nodes = allNodes.map(n => {
      const data = n.getData();
      const deps = chart._jsPlumb.getConnections({ target: n._el }).map(conn => {
        const sourceId = $(conn.source).attr('id');
        const srcNode = allNodes.find(nd => nd.getId().toString() === sourceId);
        return srcNode ? srcNode.getData().nodeId : null;
      }).filter(id => id !== null);
      return { id: data.nodeId, name: data.name, input_dir: data.input_dir, output_dir: data.output_dir, tool: data.tool, subcommand: data.subcommand, ...(deps.length>0?{dependencies:deps}:{}) , params: data.params };
    });
    const configYaml = jsyaml.dump({ global, nodes });
    downloadText(`${flowName}.yaml`, configYaml);
    alert('YAML \u6587\u4ef6\u4fdd\u5b58\u6210\u529f\uff01');
  });

  // Import YAML
  $('#btn-load-yaml').click(() => { $('#yaml-file-input').click(); });

  // Normalize node fields that may be arrays-of-maps in YAML into plain objects
  function toDict(maybe) {
    if (Array.isArray(maybe)) {
      const out = {};
      maybe.forEach((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          Object.entries(item).forEach(([k, v]) => { out[k] = v; });
        }
      });
      return out;
    }
    if (maybe && typeof maybe === 'object') return maybe;
    return {};
  }
  function normalizeConfig(cfg) {
    if (!cfg || !Array.isArray(cfg.nodes)) return cfg;
    cfg.nodes.forEach((n) => {
      n.input_dir = toDict(n.input_dir);
      n.params = toDict(n.params);
    });
    return cfg;
  }

  function computeAutoLayout(nodes) {
    const positions = new Map();
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return { positions, bounds: null };
    }

    const { COLUMN_GAP, BASE_X, BASE_Y, ROW_GAP } = AUTO_LAYOUT;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node, idx) => {
      if (!node) return;
      const id = Number(node.id ?? node.nodeId);
      if (!Number.isFinite(id)) return;
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = BASE_X + col * COLUMN_GAP;
      const y = BASE_Y + row * ROW_GAP;
      positions.set(id, { x, y });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    if (!Number.isFinite(minX)) {
      minX = BASE_X;
      maxX = BASE_X;
      minY = BASE_Y;
      maxY = BASE_Y;
    }

    return { positions, bounds: { minX, maxX, minY, maxY } };
  }

  async function buildFlowFromConfig(config) {
    if (!config || !Array.isArray(config.nodes)) {
      throw new Error("配置文件缺少 nodes 数组");
    }

    resetViewport();

    const globalCfg = config.global || {};
    if (typeof globalCfg.flow_name !== "undefined") {
      $("#global-flow-name").val(globalCfg.flow_name);
    }
    if (typeof globalCfg.parallelize !== "undefined") {
      $("#global-parallelize").val(globalCfg.parallelize);
    }
    if (typeof globalCfg.log_dir !== "undefined") {
      $("#global-log-dir").val(globalCfg.log_dir);
    }

    const nodes = config.nodes.slice();
    const processEntries = nodes
      .map((node, idx) => ({ node, idx }))
      .filter(({ node }) => {
        if (!node) return false;
        const rawId = node.id ?? node.nodeId;
        const nodeId = Number(rawId);
        const tool = (node.tool || '').toLowerCase();
        const className = (node.className || '').toLowerCase();
        if (nodeId === -1 || nodeId === -2) return false;
        if (tool === 'start' || tool === 'end') return false;
        if (className === 'node-start' || className === 'node-end') return false;
        return true;
      });
    const processNodes = processEntries.map(entry => entry.node);
    const autoLayout = computeAutoLayout(processNodes);
    const plumb = chart._jsPlumb;
    if (!plumb) {
      throw new Error("jsPlumb 实例未就绪");
    }

    chart.clear();
    currentNode = null;

    const nodeMap = new Map();

    let maxNodeId = 0;
    let placementIndex = 0;
    const { BASE_X, BASE_Y, COLUMN_GAP, ROW_GAP } = AUTO_LAYOUT;
    processEntries.forEach(({ node }) => {
      const rawId = node.id ?? node.nodeId;
      const nodeId = Number(rawId);
      if (!Number.isFinite(nodeId)) {
        throw new Error(`节点 ${node.name || rawId} 缺少合法的 id`);
      }
      const nameFromConfig = node.name || (node.subcommand ? `${node.tool || ""} (${node.subcommand})` : (node.tool || `节点${nodeId}`));
      const fallbackIndex = placementIndex++;
      const fallbackColumn = fallbackIndex % 3;
      const fallbackRow = Math.floor(fallbackIndex / 3);
      const position = autoLayout.positions.get(nodeId) || {
        x: BASE_X + fallbackColumn * COLUMN_GAP,
        y: BASE_Y + fallbackRow * ROW_GAP
      };
      const nodeData = {
        nodeId,
        name: nameFromConfig,
        tool: node.tool || "",
        subcommand: node.subcommand || "",
        input_dir: node.input_dir || {},
        output_dir: node.output_dir || "",
        params: node.params || {}
      };
      const chartNode = chart.addNode(nameFromConfig, position.x, position.y, {
        id: nodeId,
        class: "node-process",
        data: nodeData
      });
      chartNode.addPort({ isSource: true, uuid: portUuid(nodeId, 'source') });
      chartNode.addPort({ isTarget: true, position: "Top", uuid: portUuid(nodeId, 'target') });
      nodeMap.set(nodeId, chartNode);
      if (nodeId > maxNodeId) {
        maxNodeId = nodeId;
      }
    });

    nodes.forEach((node) => {
      const targetId = Number(node.id ?? node.nodeId);
      const targetNode = nodeMap.get(targetId);
      if (!targetNode) return;
      const deps = Array.isArray(node.dependencies) ? node.dependencies : [];
      deps.forEach((dep) => {
        const depId = Number(dep);
        if (!Number.isFinite(depId)) return;
        const sourceNode = nodeMap.get(depId);
        if (!sourceNode) return;
        const sourceUuid = portUuid(depId, 'source');
        const targetUuid = portUuid(targetId, 'target');
        try {
          plumb.connect({ uuids: [sourceUuid, targetUuid] });
        } catch (connectionError) {
          try {
            plumb.connect({ source: sourceNode.getId().toString(), target: targetNode.getId().toString(), anchors: ["Bottom", "Top"] });
          } catch (fallbackError) {
            console.error("创建连线失败:", connectionError, fallbackError);
          }
        }
      });
    });

    const firstProcessNode = processEntries[0]?.node || null;
    const fallbackNode = firstProcessNode || nodes.find((node) => {
      const id = Number(node?.id ?? node?.nodeId);
      return Number.isFinite(id);
    }) || null;
    const firstNodeId = Number((fallbackNode?.id ?? fallbackNode?.nodeId));
    if (Number.isFinite(firstNodeId) && nodeMap.has(firstNodeId)) {
      currentNode = nodeMap.get(firstNodeId).getData();
      showNodeConfig(currentNode);
    }

    nodeCounter = Math.max(maxNodeId + 1, 1);
    plumb.repaintEverything();
  }
  $("#yaml-file-input").on("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const content = await readFile(file);
      if (typeof jsyaml === 'undefined') { alert('js-yaml not loaded'); return; }
      const config = normalizeConfig(jsyaml.load(content));
      await buildFlowFromConfig(config);
      alert("\u6d41\u7a0b\u56fe\u52a0\u8f7d\u6210\u529f\uff01(\u5df2\u81ea\u52a8\u5e03\u5c40)");
      $(this).val('');
    } catch (error) {
      console.error('Load failed:', error);
      alert(`Load failed: ${error.message}`);
    }
  });

  // Init
  renderToolFilter();
  renderPredefinedNodes();
  bindToolFilterEvents();
  bindPredefinedEvents();
});
