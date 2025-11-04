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

  // Start/End nodes
  const DEFAULT_START_POS = { x: 800, y: 20 };
  const DEFAULT_END_POS = { x: 800, y: 500 };
  let startNode = null;
  let endNode = null;

  function addAnchorNodes(startPos = DEFAULT_START_POS, endPos = DEFAULT_END_POS) {
    startNode = chart.addNode("\u5f00\u59cb", startPos.x, startPos.y, {
      id: -1,
      class: "node-start",
      data: { nodeId: -1, name: "\u5f00\u59cb", tool: "start", subcommand: "", input_dir: {}, output_dir: "", params: {} }
    });
    startNode.addPort({ isSource: true, uuid: portUuid(-1, 'source') });

    endNode = chart.addNode("\u7ed3\u675f", endPos.x, endPos.y, {
      id: -2,
      class: "node-end",
      data: { nodeId: -2, name: "\u7ed3\u675f", tool: "end", subcommand: "", input_dir: {}, output_dir: "", params: {} }
    });
    endNode.addPort({ isTarget: true, position: "Top", uuid: portUuid(-2, 'target') });
  }

  addAnchorNodes();

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
    const layout = allNodes.map(n => { const p = n.getPos(); return { id: n.getData().nodeId, x: p.x, y: p.y }; });
    const configYaml = jsyaml.dump({ global, nodes });
    const positionYaml = jsyaml.dump({ nodes: layout });
    downloadText(`${flowName}.yaml`, configYaml);
    downloadText(`${flowName}-position.yaml`, positionYaml);
    alert('YAML \u6587\u4ef6\u4fdd\u5b58\u6210\u529f\uff01');
  });

  // Import YAML (with optional position)
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

  function mapPositions(positionData) {
    const posMap = new Map();
    if (!positionData || !Array.isArray(positionData.nodes)) {
      return posMap;
    }
    positionData.nodes.forEach((entry) => {
      if (!entry) return;
      const rawId = entry.id ?? entry.nodeId;
      const id = Number(rawId);
      if (!Number.isFinite(id)) return;
      const x = Number(entry.x ?? entry.positionX);
      const y = Number(entry.y ?? entry.positionY);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      posMap.set(id, { x, y });
    });
    return posMap;
  }

  function computeAutoLayout(nodes, orderIndexOverride) {
    const positions = new Map();
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return { positions, bounds: null };
    }

    const nodeById = new Map();
    const orderIndex = new Map();
    nodes.forEach((node, idx) => {
      if (!node) return;
      const id = Number(node.id ?? node.nodeId);
      if (!Number.isFinite(id)) return;
      nodeById.set(id, node);
      if (orderIndexOverride && orderIndexOverride.has(id)) {
        orderIndex.set(id, orderIndexOverride.get(id));
      } else {
        orderIndex.set(id, idx);
      }
    });

    const memo = new Map();
    function resolveLevel(id, stack = new Set()) {
      if (!nodeById.has(id)) return 0;
      if (memo.has(id)) return memo.get(id);
      if (stack.has(id)) return 0;
      stack.add(id);
      const node = nodeById.get(id);
      const deps = Array.isArray(node.dependencies) ? node.dependencies : [];
      let level = 0;
      deps.forEach((dep) => {
        const depId = Number(dep);
        if (!Number.isFinite(depId)) return;
        const depLevel = resolveLevel(depId, stack) + 1;
        if (depLevel > level) level = depLevel;
      });
      stack.delete(id);
      memo.set(id, level);
      return level;
    }

    nodeById.forEach((_, id) => { resolveLevel(id); });

    const levelBuckets = new Map();
    nodeById.forEach((_, id) => {
      const level = memo.get(id) || 0;
      if (!levelBuckets.has(level)) {
        levelBuckets.set(level, []);
      }
      levelBuckets.get(level).push(id);
    });

    levelBuckets.forEach((ids) => {
      ids.sort((a, b) => {
        const ia = orderIndex.get(a) ?? 0;
        const ib = orderIndex.get(b) ?? 0;
        return ia - ib;
      });
    });

    const COLUMN_GAP = 260;
    const ROW_GAP = 140;
    const BASE_X = 280;
    const BASE_Y = 120;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    Array.from(levelBuckets.keys()).sort((a, b) => a - b).forEach((level) => {
      const ids = levelBuckets.get(level) || [];
      ids.forEach((id, idx) => {
        const x = BASE_X + level * COLUMN_GAP;
        const y = BASE_Y + idx * ROW_GAP;
        positions.set(id, { x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    if (!Number.isFinite(minX)) {
      minX = BASE_X;
      maxX = BASE_X;
      minY = BASE_Y;
      maxY = BASE_Y;
    }

    return { positions, bounds: { minX, maxX, minY, maxY } };
  }

  async function buildFlowFromConfigAndPosition(config, positionData) {
    if (!config || !Array.isArray(config.nodes)) {
      throw new Error("配置文件缺少 nodes 数组");
    }

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
    const orderIndex = new Map();
    nodes.forEach((node, idx) => {
      if (!node) return;
      const rawId = node.id ?? node.nodeId;
      const nodeId = Number(rawId);
      if (Number.isFinite(nodeId)) {
        orderIndex.set(nodeId, idx);
      }
    });

    const providedPositions = mapPositions(positionData);
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
    const autoLayout = computeAutoLayout(processNodes, orderIndex);
    const plumb = chart._jsPlumb;
    if (!plumb) {
      throw new Error("jsPlumb 实例未就绪");
    }

    chart.clear();
    addAnchorNodes();
    currentNode = null;

    const nodeMap = new Map();
    nodeMap.set(-1, startNode);
    nodeMap.set(-2, endNode);
    const startAnchorOverride = providedPositions.get(-1);
    const endAnchorOverride = providedPositions.get(-2);

    let maxNodeId = 0;
    let placementIndex = 0;
    processEntries.forEach(({ node, idx }) => {
      const rawId = node.id ?? node.nodeId;
      const nodeId = Number(rawId);
      if (!Number.isFinite(nodeId)) {
        throw new Error(`节点 ${node.name || rawId || idx} 缺少合法的 id`);
      }
      const nameFromConfig = node.name || (node.subcommand ? `${node.tool || ""} (${node.subcommand})` : (node.tool || `节点${nodeId}`));
      const fallbackIndex = placementIndex++;
      const position = providedPositions.get(nodeId) || autoLayout.positions.get(nodeId) || {
        x: 300 + fallbackIndex * 40,
        y: 140 + fallbackIndex * 40
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

    if (nodeMap.size > 0) {
      const firstNodeId = Number(nodes[0].id ?? nodes[0].nodeId);
      const firstChartNode = nodeMap.get(firstNodeId);
      if (firstChartNode) {
        currentNode = firstChartNode.getData();
        showNodeConfig(currentNode);
      }
    }

    const bounds = autoLayout.bounds;
    const hasProcessLayout = processEntries.length > 0 && bounds;
    const startPos = startAnchorOverride
      ? { x: startAnchorOverride.x, y: startAnchorOverride.y }
      : (hasProcessLayout
        ? {
            x: Math.max(40, bounds.minX - 220),
            y: Math.max(20, bounds.minY)
          }
        : { ...DEFAULT_START_POS });
    const endPos = endAnchorOverride
      ? { x: endAnchorOverride.x, y: endAnchorOverride.y }
      : (hasProcessLayout
        ? {
            x: bounds.maxX + 220,
            y: bounds.maxY + 40
          }
        : { ...DEFAULT_END_POS });

    startNode._el.css({ left: `${startPos.x}px`, top: `${startPos.y}px` });
    endNode._el.css({ left: `${endPos.x}px`, top: `${endPos.y}px` });
    startNode.updatePos();
    endNode.updatePos();

    nodeCounter = Math.max(maxNodeId + 1, 1);
    window.flowConfig = null;
    plumb.repaintEverything();
  }
  $("#yaml-file-input").on("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const content = await readFile(file);
      if (typeof jsyaml === 'undefined') { alert('js-yaml not loaded'); return; }
      const config = normalizeConfig(jsyaml.load(content));
      const usePosition = $("#use-position-file").is(":checked");
      if (usePosition) {
        alert("\u8bf7\u9009\u62e9\u5bf9\u5e94\u7684\u4f4d\u7f6e\u6587\u4ef6(\u6587\u4ef6\u540d\u4ee5 -position.yaml \u7ed3\u5c3e)");
        $("#position-file-input").val("");
        $("#position-file-input").click();
        window.flowConfig = config;
      } else {
        await buildFlowFromConfigAndPosition(config, null);
        alert("\u6d41\u7a0b\u56fe\u52a0\u8f7d\u6210\u529f\uff01(\u5df2\u81ea\u52a8\u5e03\u5c40)");
        $(this).val('');
        $("#position-file-input").val('');
      }
    } catch (error) {
      console.error('Load failed:', error);
      alert(`Load failed: ${error.message}`);
    }
  });
  $("#position-file-input").off("change").on("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const content = await readFile(file);
      const positionData = jsyaml.load(content);
      const config = normalizeConfig(window.flowConfig);
      await buildFlowFromConfigAndPosition(config, positionData);
      alert("\u6d41\u7a0b\u56fe\u52a0\u8f7d\u6210\u529f\uff01(\u4f7f\u7528\u4f4d\u7f6e\u6587\u4ef6)");
    } catch (error) {
      console.error('Load failed:', error);
      alert(`Load failed: ${error.message}`);
    }
    $(this).val('');
    $("#yaml-file-input").val('');
  });

  // Init
  renderToolFilter();
  renderPredefinedNodes();
  bindToolFilterEvents();
  bindPredefinedEvents();
});
