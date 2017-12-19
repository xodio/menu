import _extends from 'babel-runtime/helpers/extends';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Trigger from 'rc-trigger';
import KeyCode from 'rc-util/es/KeyCode';
import classNames from 'classnames';
import SubPopupMenu from './SubPopupMenu';
import placements from './placements';
import { noop, loopMenuItemRecusively } from './util';

var guid = 0;

var popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop'
};

var SubMenu = createReactClass({
  displayName: 'SubMenu',

  propTypes: {
    parentMenu: PropTypes.object,
    title: PropTypes.node,
    children: PropTypes.any,
    selectedKeys: PropTypes.array,
    openKeys: PropTypes.array,
    onClick: PropTypes.func,
    onOpenChange: PropTypes.func,
    rootPrefixCls: PropTypes.string,
    eventKey: PropTypes.string,
    multiple: PropTypes.bool,
    active: PropTypes.bool, // TODO: remove
    onItemHover: PropTypes.func,
    onSelect: PropTypes.func,
    triggerSubMenuAction: PropTypes.string,
    onDeselect: PropTypes.func,
    onDestroy: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onTitleMouseEnter: PropTypes.func,
    onTitleMouseLeave: PropTypes.func,
    onTitleClick: PropTypes.func
  },

  contextTypes: {
    popupPlacements: PropTypes.object
  },

  isRootMenu: false,

  getDefaultProps: function getDefaultProps() {
    return {
      onMouseEnter: noop,
      onMouseLeave: noop,
      onTitleMouseEnter: noop,
      onTitleMouseLeave: noop,
      onTitleClick: noop,
      title: ''
    };
  },
  getInitialState: function getInitialState() {
    this.isSubMenu = 1;
    return {
      defaultActiveFirst: false
    };
  },
  componentDidMount: function componentDidMount() {
    this.componentDidUpdate();
  },
  componentDidUpdate: function componentDidUpdate() {
    var _this = this;

    var _props = this.props,
        mode = _props.mode,
        parentMenu = _props.parentMenu;

    if (mode !== 'horizontal' || !parentMenu.isRootMenu || !this.isOpen()) {
      return;
    }
    setTimeout(function () {
      if (!_this.subMenuTitle || !_this.menuInstance) {
        return;
      }
      var popupMenu = ReactDOM.findDOMNode(_this.menuInstance);
      if (popupMenu.offsetWidth >= _this.subMenuTitle.offsetWidth) {
        return;
      }
      popupMenu.style.minWidth = _this.subMenuTitle.offsetWidth + 'px';
    }, 0);
  },
  componentWillUnmount: function componentWillUnmount() {
    var _props2 = this.props,
        onDestroy = _props2.onDestroy,
        eventKey = _props2.eventKey,
        parentMenu = _props2.parentMenu;

    if (onDestroy) {
      onDestroy(eventKey);
    }
    if (parentMenu.subMenuInstance === this) {
      this.clearSubMenuTimers();
    }
  },
  onDestroy: function onDestroy(key) {
    this.props.onDestroy(key);
  },
  onKeyDown: function onKeyDown(e) {
    var keyCode = e.keyCode;
    var menu = this.menuInstance;
    var isOpen = this.isOpen();

    if (keyCode === KeyCode.ENTER) {
      this.onTitleClick(e);
      this.setState({
        defaultActiveFirst: true
      });
      return true;
    }

    if (keyCode === KeyCode.RIGHT) {
      if (isOpen) {
        menu.onKeyDown(e);
      } else {
        this.triggerOpenChange(true);
        this.setState({
          defaultActiveFirst: true
        });
      }
      return true;
    }
    if (keyCode === KeyCode.LEFT) {
      var handled = void 0;
      if (isOpen) {
        handled = menu.onKeyDown(e);
      } else {
        return undefined;
      }
      if (!handled) {
        this.triggerOpenChange(false);
        handled = true;
      }
      return handled;
    }

    if (isOpen && (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN)) {
      return menu.onKeyDown(e);
    }
  },
  onOpenChange: function onOpenChange(e) {
    this.props.onOpenChange(e);
  },
  onPopupVisibleChange: function onPopupVisibleChange(visible) {
    this.triggerOpenChange(visible, visible ? 'mouseenter' : 'mouseleave');
  },
  onMouseEnter: function onMouseEnter(e) {
    var _props3 = this.props,
        key = _props3.eventKey,
        onMouseEnter = _props3.onMouseEnter;

    this.clearSubMenuLeaveTimer();
    this.setState({
      defaultActiveFirst: false
    });
    onMouseEnter({
      key: key,
      domEvent: e
    });
  },
  onMouseLeave: function onMouseLeave(e) {
    var _props4 = this.props,
        parentMenu = _props4.parentMenu,
        eventKey = _props4.eventKey,
        onMouseLeave = _props4.onMouseLeave;

    parentMenu.subMenuInstance = this;
    parentMenu.subMenuLeaveFn = function () {
      // trigger mouseleave
      onMouseLeave({
        key: eventKey,
        domEvent: e
      });
    };
    // prevent popup menu and submenu gap
    parentMenu.subMenuLeaveTimer = setTimeout(parentMenu.subMenuLeaveFn, 100);
  },
  onTitleMouseEnter: function onTitleMouseEnter(domEvent) {
    var _props5 = this.props,
        key = _props5.eventKey,
        onItemHover = _props5.onItemHover,
        onTitleMouseEnter = _props5.onTitleMouseEnter;

    this.clearSubMenuTitleLeaveTimer();
    onItemHover({
      key: key,
      hover: true
    });
    onTitleMouseEnter({
      key: key,
      domEvent: domEvent
    });
  },
  onTitleMouseLeave: function onTitleMouseLeave(e) {
    var _props6 = this.props,
        parentMenu = _props6.parentMenu,
        eventKey = _props6.eventKey,
        onItemHover = _props6.onItemHover,
        onTitleMouseLeave = _props6.onTitleMouseLeave;

    parentMenu.subMenuInstance = this;
    parentMenu.subMenuTitleLeaveFn = function () {
      onItemHover({
        key: eventKey,
        hover: false
      });
      onTitleMouseLeave({
        key: eventKey,
        domEvent: e
      });
    };
    parentMenu.subMenuTitleLeaveTimer = setTimeout(parentMenu.subMenuTitleLeaveFn, 100);
  },
  onTitleClick: function onTitleClick(e) {
    var props = this.props;

    props.onTitleClick({
      key: props.eventKey,
      domEvent: e
    });
    if (props.triggerSubMenuAction === 'hover') {
      return;
    }
    this.triggerOpenChange(!this.isOpen(), 'click');
    this.setState({
      defaultActiveFirst: false
    });
  },
  onSubMenuClick: function onSubMenuClick(info) {
    this.props.onClick(this.addKeyPath(info));
  },
  onSelect: function onSelect(info) {
    this.props.onSelect(info);
  },
  onDeselect: function onDeselect(info) {
    this.props.onDeselect(info);
  },
  getPrefixCls: function getPrefixCls() {
    return this.props.rootPrefixCls + '-submenu';
  },
  getActiveClassName: function getActiveClassName() {
    return this.getPrefixCls() + '-active';
  },
  getDisabledClassName: function getDisabledClassName() {
    return this.getPrefixCls() + '-disabled';
  },
  getSelectedClassName: function getSelectedClassName() {
    return this.getPrefixCls() + '-selected';
  },
  getOpenClassName: function getOpenClassName() {
    return this.props.rootPrefixCls + '-submenu-open';
  },
  saveMenuInstance: function saveMenuInstance(c) {
    this.menuInstance = c;
  },
  addKeyPath: function addKeyPath(info) {
    return _extends({}, info, {
      keyPath: (info.keyPath || []).concat(this.props.eventKey)
    });
  },
  triggerOpenChange: function triggerOpenChange(open, type) {
    var key = this.props.eventKey;
    this.onOpenChange({
      key: key,
      item: this,
      trigger: type,
      open: open
    });
  },
  clearSubMenuTimers: function clearSubMenuTimers() {
    this.clearSubMenuLeaveTimer();
    this.clearSubMenuTitleLeaveTimer();
  },
  clearSubMenuTitleLeaveTimer: function clearSubMenuTitleLeaveTimer() {
    var parentMenu = this.props.parentMenu;
    if (parentMenu.subMenuTitleLeaveTimer) {
      clearTimeout(parentMenu.subMenuTitleLeaveTimer);
      parentMenu.subMenuTitleLeaveTimer = null;
      parentMenu.subMenuTitleLeaveFn = null;
    }
  },
  clearSubMenuLeaveTimer: function clearSubMenuLeaveTimer() {
    var parentMenu = this.props.parentMenu;
    if (parentMenu.subMenuLeaveTimer) {
      clearTimeout(parentMenu.subMenuLeaveTimer);
      parentMenu.subMenuLeaveTimer = null;
      parentMenu.subMenuLeaveFn = null;
    }
  },
  isChildrenSelected: function isChildrenSelected() {
    var ret = { find: false };
    loopMenuItemRecusively(this.props.children, this.props.selectedKeys, ret);
    return ret.find;
  },
  isOpen: function isOpen() {
    return this.props.openKeys.indexOf(this.props.eventKey) !== -1;
  },
  renderChildren: function renderChildren(children) {
    var props = this.props;
    var baseProps = {
      mode: props.mode === 'horizontal' ? 'vertical' : props.mode,
      visible: this.isOpen(),
      level: props.level + 1,
      inlineIndent: props.inlineIndent,
      focusable: false,
      onClick: this.onSubMenuClick,
      onSelect: this.onSelect,
      onDeselect: this.onDeselect,
      onDestroy: this.onDestroy,
      selectedKeys: props.selectedKeys,
      eventKey: props.eventKey + '-menu-',
      openKeys: props.openKeys,
      openTransitionName: props.openTransitionName,
      openAnimation: props.openAnimation,
      onOpenChange: this.onOpenChange,
      subMenuOpenDelay: props.subMenuOpenDelay,
      subMenuCloseDelay: props.subMenuCloseDelay,
      forceSubMenuRender: props.forceSubMenuRender,
      triggerSubMenuAction: props.triggerSubMenuAction,
      defaultActiveFirst: this.state.defaultActiveFirst,
      multiple: props.multiple,
      prefixCls: props.rootPrefixCls,
      id: this._menuId,
      ref: this.saveMenuInstance
    };
    return React.createElement(
      SubPopupMenu,
      baseProps,
      children
    );
  },
  saveSubMenuTitle: function saveSubMenuTitle(subMenuTitle) {
    this.subMenuTitle = subMenuTitle;
  },
  render: function render() {
    var _classNames;

    var props = this.props;
    var isOpen = this.isOpen();
    var prefixCls = this.getPrefixCls();
    var isInlineMode = props.mode === 'inline';
    var className = classNames(prefixCls, prefixCls + '-' + props.mode, (_classNames = {}, _classNames[props.className] = !!props.className, _classNames[this.getOpenClassName()] = isOpen, _classNames[this.getActiveClassName()] = props.active || isOpen && !isInlineMode, _classNames[this.getDisabledClassName()] = props.disabled, _classNames[this.getSelectedClassName()] = this.isChildrenSelected(), _classNames));

    if (!this._menuId) {
      if (props.eventKey) {
        this._menuId = props.eventKey + '$Menu';
      } else {
        this._menuId = '$__$' + ++guid + '$Menu';
      }
    }

    var mouseEvents = {};
    var titleClickEvents = {};
    var titleMouseEvents = {};
    if (!props.disabled) {
      mouseEvents = {
        onMouseLeave: this.onMouseLeave,
        onMouseEnter: this.onMouseEnter
      };

      // only works in title, not outer li
      titleClickEvents = {
        onClick: this.onTitleClick
      };
      titleMouseEvents = {
        onMouseEnter: this.onTitleMouseEnter,
        onMouseLeave: this.onTitleMouseLeave
      };
    }

    var style = {};
    if (isInlineMode) {
      style.paddingLeft = props.inlineIndent * props.level;
    }
    var title = React.createElement(
      'div',
      _extends({
        ref: this.saveSubMenuTitle,
        style: style,
        className: prefixCls + '-title'
      }, titleMouseEvents, titleClickEvents, {
        'aria-expanded': isOpen,
        'aria-owns': this._menuId,
        'aria-haspopup': 'true',
        title: typeof props.title === 'string' ? props.title : undefined
      }),
      props.title,
      React.createElement('i', { className: prefixCls + '-arrow' })
    );
    var children = this.renderChildren(props.children);

    var getPopupContainer = props.parentMenu.isRootMenu ? props.parentMenu.props.getPopupContainer : function (triggerNode) {
      return triggerNode.parentNode;
    };
    var popupPlacement = popupPlacementMap[props.mode];
    var popupClassName = props.mode === 'inline' ? '' : props.popupClassName;
    return React.createElement(
      'li',
      _extends({}, mouseEvents, { className: className, style: props.style }),
      isInlineMode && title,
      isInlineMode && children,
      !isInlineMode && React.createElement(
        Trigger,
        {
          prefixCls: prefixCls,
          popupClassName: prefixCls + '-popup ' + popupClassName,
          getPopupContainer: getPopupContainer,
          builtinPlacements: _extends({}, placements, this.context.popupPlacements),
          popupPlacement: popupPlacement,
          popupVisible: isOpen,
          popup: children,
          action: props.disabled ? [] : [props.triggerSubMenuAction],
          mouseEnterDelay: props.subMenuOpenDelay,
          mouseLeaveDelay: props.subMenuCloseDelay,
          onPopupVisibleChange: this.onPopupVisibleChange,
          forceRender: props.forceSubMenuRender
        },
        title
      )
    );
  }
});

SubMenu.isSubMenu = 1;

export default SubMenu;