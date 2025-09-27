Chart.ready(() => {
    let currentNode = null;
    let nodeCounter = 1;

    const chart = new Chart($('#js-chart'), {
        onNodeClick(data) {
            currentNode = data;
            showNodeConfig(data);
        }
    });

    // 初始化：绘制开始和结束节点
    const startNode = chart.addNode("开始", 800, 20, {
        id: -1,
        class: "node-start",
        data: {
            nodeId: -1,
            name: "开始",
            tool: "start",
            input_dir: {},
            output_dir: "",
            log_dir: "",
            params: {}
        }
    });
    startNode.addPort({ isSource: true });

    const endNode = chart.addNode("结束", 800, 500, {
        id: -2,
        class: "node-end",
        data: {
            nodeId: -2,
            name: "结束",
            tool: "end",
            input_dir: {},
            output_dir: "",
            log_dir: "",
            params: {}
        }
    });
    endNode.addPort({ isTarget: true, position: "Top" });

    // 渲染左侧预定义节点
    function renderPredefinedNodes() {
        const html = PREDEFINED_NODES.map((node, idx) => `
            <li>
                <div>
                    <strong>工具:</strong> 
                    <input type="text" class="node-name-input" data-idx="${idx}" value="${node.name || '请输入名称'}">
                </div>
                <div>操作: ${node.tool}</div>
                <a class="btn-add" href="javascript:void(0)" data-idx="${idx}">添加</a>
            </li>
        `).join('');
        $(".nodes").html(html);
    }

    // 绑定节点名称修改事件
    function bindNameEditEvents() {
        $(".nodes").on("change", ".node-name-input", function () {
            const idx = $(this).data("idx");
            const newName = $(this).val().trim();
            if (newName) {
                PREDEFINED_NODES[idx].name = newName;
            }
        });
    }

    // 点击添加按钮 → 添加节点到画布
    function bindPredefinedEvents() {
        $(".nodes").on("click", ".btn-add", function () {
            const idx = $(this).data("idx");
            const nodeData = PREDEFINED_NODES[idx];

            // 获取输入的名称，如果为空则使用工具名
            const nodeName = nodeData.name || nodeData.tool || '新节点';
            const nodeId = nodeCounter++;

            const newNode = chart.addNode(nodeName, 100, 100, {
                id: nodeId,
                class: 'node-process',
                data: {
                    nodeId: nodeId,
                    name: nodeName,
                    ...nodeData
                }
            });

            newNode.addPort({ isSource: true });
            newNode.addPort({ isTarget: true, position: 'Top' });
        });
    }

    // 展示右侧面板参数（包含重命名输入框）
    function showNodeConfig(data) {
        $('.proc-name').text(data.name || '');
        $('.node-rename-input').val(data.name || ''); // 设置重命名输入框的值
        $('.field-tool').val(data.tool || '');
        $('.field-output').val(data.output_dir || '');
        $('.field-log').val(data.log_dir || '');

        const inputFields = Object.entries(data.input_dir || {}).map(([key, value]) => {
            return `<div><label>${key}:</label><input type="text" data-key="${key}" value="${value}"></div>`;
        }).join('');
        $('.input-dir-fields').html(inputFields);

        const paramFields = Object.entries(data.params || {}).map(([key, value]) => {
            return `<div><label>${key}:</label><input type="text" data-key="${key}" value="${value}"></div>`;
        }).join('');
        $('.params-fields').html(paramFields);
    }

    // 保存按钮绑定
    $('.btn-save-prop').click(() => {
        if (!currentNode) return;

        currentNode.output_dir = $('.field-output').val();
        currentNode.log_dir = $('.field-log').val();

        $('.input-dir-fields input').each(function () {
            const key = $(this).data('key');
            currentNode.input_dir[key] = $(this).val();
        });

        $('.params-fields input').each(function () {
            const key = $(this).data('key');
            currentNode.params[key] = $(this).val();
        });

        alert('属性保存成功！');
    });

    // 还原按钮绑定
    $('.btn-reset-prop').click(() => {
        if (!currentNode) return;
        showNodeConfig(currentNode);
    });

    // 重命名按钮事件 - 实现流程图中名称同步更新
    $('.btn-rename').click(() => {
        if (!currentNode) return;

        const newName = $('.node-rename-input').val().trim();
        if (!newName) {
            alert('节点名称不能为空');
            return;
        }

        // 更新节点数据
        currentNode.name = newName;

        // 更新流程图中显示的节点名称
        chart.getNodes().forEach(node => {
            if (node.getData().nodeId === currentNode.nodeId) {
                node.setName(newName);
            }
        });

        // 更新右侧面板标题
        $('.proc-name').text(newName);

        alert('节点重命名成功！');
    });

    // 添加回车键支持
    $('.node-rename-input').on('keypress', function (e) {
        if (e.which === 13) { // 回车键
            $('.btn-rename').click();
        }
    });

    function downloadText(filename, text) {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    $('#btn-save-yaml').click(() => {
        const flowName = $('#global-flow-name').val().trim() || 'flow';
        const global = {
            flow_name: flowName,
            parallelize: $('#global-parallelize').val(),
            log_dir: $('#global-log-dir').val()
        };

        const allNodes = chart.getNodes();

        // 确保所有节点的位置信息是最新的
        allNodes.forEach(node => {
            node.updatePos();
        });

        const nodes = allNodes.map(n => {
            const data = n.getData();
            const deps = chart._jsPlumb.getConnections({ target: n._el }).map(conn => {
                const sourceId = $(conn.source).attr('id');
                const srcNode = allNodes.find(nd => nd.getId().toString() === sourceId);
                return srcNode ? srcNode.getData().nodeId : null;
            }).filter(id => id !== null);

            return {
                id: data.nodeId,
                name: data.name,
                input_dir: data.input_dir,
                output_dir: data.output_dir,
                tool: data.tool,
                log_dir: data.log_dir,
                ...(deps.length > 0 ? { dependencies: deps } : {}),
                params: data.params
            };
        });

        const layout = allNodes.map(n => {
            const pos = n.getPos();
            return {
                id: n.getData().nodeId,
                x: pos.x,
                y: pos.y
            };
        });

        const configYaml = jsyaml.dump({ global, nodes });
        const positionYaml = jsyaml.dump({ nodes: layout });

        downloadText(`${flowName}.yaml`, configYaml);
        downloadText(`${flowName}-position.yaml`, positionYaml);

        alert('YAML文件保存成功！');
    });

    // 改进的YAML加载功能
    let positionData = null;

    $('#btn-load-yaml').click(() => {
        $('#yaml-file-input').click();
    });

    $('#yaml-file-input').on('change', async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await readFile(file);
            const config = jsyaml.load(content);

            // 请求用户选择位置文件
            alert('请选择对应的位置文件 (文件名以 -position.yaml 结尾)');
            $('#position-file-input').click();

            // 保存配置数据供后续使用
            window.flowConfig = config;
        } catch (error) {
            console.error('加载失败:', error);
            alert(`加载失败: ${error.message}`);
        }
    });

    $('#position-file-input').on('change', async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await readFile(file);
            positionData = jsyaml.load(content);

            // 使用保存的配置数据
            const config = window.flowConfig;

            // 更新全局配置
            if (config.global) {
                $('#global-flow-name').val(config.global.flow_name || '');
                $('#global-parallelize').val(config.global.parallelize || '');
                $('#global-log-dir').val(config.global.log_dir || '');
            }

            // 清空当前图表
            chart.clear();
            nodeCounter = 1;

            // 创建节点映射表（id -> 节点实例）
            const nodeMap = new Map();

            // 第一步：创建所有节点
            if (config.nodes && Array.isArray(config.nodes)) {
                for (const nodeData of config.nodes) {
                    // 查找节点位置
                    let x = 100, y = 100;
                    if (positionData && positionData.nodes) {
                        const posNode = positionData.nodes.find(n => n.id === nodeData.id);
                        if (posNode) {
                            x = posNode.x;
                            y = posNode.y;
                        }
                    }

                    // 确定节点样式
                    let nodeClass = 'node-process';
                    if (nodeData.tool === 'start') nodeClass = 'node-start';
                    if (nodeData.tool === 'end') nodeClass = 'node-end';

                    // 创建节点
                    const node = chart.addNode(
                        nodeData.name || `节点${nodeData.id}`,
                        x,
                        y,
                        {
                            id: nodeData.id,
                            class: nodeClass,
                            data: { ...nodeData }
                        }
                    );

                    // 添加端口
                    if (nodeData.tool !== 'end') {
                        node.addPort({ isSource: true, anchor: "Right" });
                    }
                    if (nodeData.tool !== 'start') {
                        node.addPort({ isTarget: true, position: "Top", anchor: "Top" });
                    }

                    // 更新节点计数器
                    if (nodeData.id >= nodeCounter) {
                        nodeCounter = nodeData.id + 1;
                    }

                    // 存入映射表
                    nodeMap.set(nodeData.id, node);
                }
            }

            // 第二步：创建连接线（必须在所有节点创建后执行）
            if (config.nodes && Array.isArray(config.nodes)) {
                for (const nodeData of config.nodes) {
                    if (nodeData.dependencies && Array.isArray(nodeData.dependencies)) {
                        for (const depId of nodeData.dependencies) {
                            const sourceNode = nodeMap.get(depId);
                            const targetNode = nodeMap.get(nodeData.id);

                            if (sourceNode && targetNode) {
                                // 获取源节点的输出端口和目标节点的输入端口
                                const sourcePort = sourceNode.getPorts().find(p => p.isSource);
                                const targetPort = targetNode.getPorts().find(p => p.isTarget);

                                if (sourcePort && targetPort) {
                                    // 创建连接
                                    chart._jsPlumb.connect({
                                        source: sourcePort,
                                        target: targetPort,
                                        anchors: ["Right", "Top"],
                                        connector: ["Bezier", { curviness: 50 }],
                                        paintStyle: { stroke: "#3498db", strokeWidth: 2 },
                                        endpointStyle: { radius: 5, fill: "#3498db" }
                                    });
                                }
                            }
                        }
                    }
                }
            }

            alert('流程图加载成功！');
        } catch (error) {
            console.error('加载失败:', error);
            alert(`加载失败: ${error.message}`);
        }

        // 清空文件输入，允许再次选择同一文件
        $(this).val('');
        $('#yaml-file-input').val('');
    });

    // 初始化
    renderPredefinedNodes();
    bindPredefinedEvents();
    bindNameEditEvents();
});
