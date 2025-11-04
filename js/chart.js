/**
 * @class ChartNode 流程节点
 * @param {String} id 节点ID
 * @param {String} name 节点名称
 * @param {Number} x 横坐标
 * @param {Number} y 纵坐标
 * @param {Object} options 节点配置
 * @param {String} options.class 节点的样式类名
 * @param {Object} [options.data] 节点附加数据
 * @param {Object} [options.data.input_dir] 输入路径（字典）
 * @param {String} [options.data.output_dir] 输出路径（字符串）
 * @param {String} [options.data.tool] 使用工具（字符串）
 * @param {Object} [options.data.params] 额外参数（字典）
 */
let ChartNode = function (id, name, x, y, options) {
    this._jsPlumb = null;
    this._container = null;
    this._id = id;
    this._name = name;
    this._x = x;
    this._y = y;
    this._clsName = options.class || '';
    this._data = Object.assign({
        nodeId: id,
        input_dir: {},
        output_dir: '',
        log_dir: '',
        tool: '',
        params: {}
    }, options.data || {});
    this._el = null;
    this._ports = []; // 新增：存储端口引用
};

ChartNode.lineStyle = {
    lineWidth: 1,
    joinstyle: "round",
    strokeStyle: "#0096f2"
};

ChartNode.labelPos = {
    'Bottom': [6, 2.5],
    'Top': [6, -2.5],
};

ChartNode.prototype.setPlumb = function (plumb) {
    this._jsPlumb = plumb;
};

ChartNode.prototype.getId = function () {
    return this._id;
};

ChartNode.prototype.getData = function () {
    return this._data || {};
};

ChartNode.prototype.appendTo = function (container) {
    if (!container) {
        console.error('node container is null!');
        return;
    }

    let node = $('<div>')
        .addClass(`window task ${this._clsName}`)
        .attr('id', this._id)
        .css({
            left: this._x + 'px',
            top: this._y + 'px',
            color: '#000',
            backgroundColor: '#f0f0f0',
            borderRadius: '6px'
        })
        .text(this._name)
        .data('node', this._data)
        .data('__node', this);

    if (this._clsName !== 'node-start' && this._clsName !== 'node-end') {
        node.append($('<div>').addClass('remove'));
    }

    container.append(node);
    this._jsPlumb.draggable(node, { grid: [10, 10], containment: false });

    this._el = node;
};

ChartNode.prototype.addPort = function (options) {
    let pos = options.position || 'Bottom';
    let labelPos = ChartNode.labelPos[pos];
    let endpointConf = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: options.color || '#0096f2',
            fillStyle: options.color || '#0096f2',
            radius: 6,
            lineWidth: 3
        },
        hoverPaintStyle: {
            strokeStyle: "#ff6600",
            fillStyle: "#ff6600",
            radius: 6,
            lineWidth: 4
        },
        anchor: pos,
        isSource: !!options.isSource,
        isTarget: !!options.isTarget,
        maxConnections: -1,
        connector: ["Flowchart", { stub: [15, 15], gap: 0, cornerRadius: 5, alwaysRespectStubs: true }],
        connectorStyle: ChartNode.lineStyle,
        dragOptions: {},
        overlays: [
            ["Label", {
                location: labelPos,
                label: options.label || '',
                cssClass: "endpoint-label-lkiarest"
            }]
        ],
        allowLoopback: false
    };

    if (options.uuid) {
        endpointConf.uuid = options.uuid;
    }

    const endpoint = this._jsPlumb.addEndpoint(this._el, endpointConf);
    this._ports.push(endpoint); // 存储端口引用
    return endpoint;
};

// 新增方法：获取所有端口
ChartNode.prototype.getPorts = function () {
    return this._ports;
};

ChartNode.prototype.updatePos = function () {
    let el = this._el;
    if (el) {
        this._x = parseInt(el.css("left"), 10);
        this._y = parseInt(el.css("top"), 10);
    }
    return this;
};

ChartNode.prototype.getPos = function () {
    // 确保获取的是最新位置
    this.updatePos();
    return {
        x: this._x,
        y: this._y
    };
};

// 新增方法：设置节点名称
ChartNode.prototype.setName = function (name) {
    this._name = name;
    if (this._el) {
        this._el.text(name);
    }
    if (this._data) {
        this._data.name = name;
    }
    return this;
};

ChartNode.prototype.toPlainObj = function () {
    this.updatePos();
    let data = $.extend({}, this._data);
    data.nodeId = this._id;
    data.positionX = this._x;
    data.positionY = this._y;
    data.className = this._clsName;
    return data;
};

ChartNode.prototype.dispose = function () {
    let el = this._el;
    let domEl = el.get(0);
    this._jsPlumb.detachAllConnections(domEl);
    this._jsPlumb.remove(domEl);
    el.remove();
};

let Chart = function (container, options) {
    this._jsPlumb = null;
    this._container = container;
    this._nodes = [];
    this._seedName = 'flow-chart-node';
    this._seedId = 0;
    this.init(options);
};

Chart.prototype.nodeId = function () {
    return this._seedName + (this._seedId++) + (new Date).valueOf();
};

Chart.prototype.init = function (options) {
    this._jsPlumb = jsPlumb.getInstance();
    this._jsPlumb.importDefaults({
        ConnectionOverlays: [["PlainArrow", { width: 10, location: 1, id: "arrow", length: 8 }]],
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        EndpointStyles: [{ fillStyle: '#225588' }, { fillStyle: '#558822' }],
        Endpoints: [["Dot", { radius: 2 }], ["Dot", { radius: 2 }]],
        Connector: ["Flowchart", { stub: [15, 25], gap: 0, cornerRadius: 5, alwaysRespectStubs: true }],
    });

    this._container.addClass('flow-chart-canvas-lkiarest');

    if (options && options.onNodeClick) {
        this._container.on('click', '.task', event => {
            let target = $(event.target);
            // 确保点击的是节点本身，而不是删除按钮
            if (!$(event.target).hasClass('remove')) {
                options.onNodeClick.call(this, target.data('node'));
            }
        });
    }

    this._container.on('click', '.remove', event => {
        let delNode = $(event.target).parent().data('__node');
        if (delNode) {
            let data = delNode.getData();
            let nodeId = delNode.getId();
            delNode.dispose();
            this.removeNode(nodeId);
            if (options && options.onNodeDel) {
                options.onNodeDel.call(this, data);
            }
        }
        event.stopPropagation();
    });
};

Chart.prototype.addNode = function (name, x, y, options) {
    let id = options && options.id || this.nodeId();
    let node = new ChartNode(id, name, x, y, options);
    node.setPlumb(this._jsPlumb);
    node.appendTo(this._container);
    this._nodes.push(node);
    return node;
};

Chart.prototype.removeNode = function (nodeId) {
    let nodes = this._nodes;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getId() === nodeId) {
            nodes[i].dispose();
            nodes.splice(i, 1);
            return;
        }
    }
};

Chart.prototype.getNodes = function () {
    return this._nodes;
};

Chart.prototype.clear = function () {
    this._nodes.forEach(node => node.dispose());
    this._nodes = [];
    this._jsPlumb.detachAllConnections(this._container);
    this._jsPlumb.removeAllEndpoints(this._container);
};

Chart.prototype.dispose = function () {
    this.clear();
    this._container.off('click');
    this._container = null;
};

Chart.ready = callback => {
    jsPlumb.ready(callback);
};

if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = Chart;
}
