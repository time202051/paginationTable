const defaultNameSpace = 'dyt'
const statePrefix = 'is-'
/**
 * 用来生成 BEM (Block Element Modifier) 类名
 *
 * @param {string} namespace - 类名的命名空间
 * @param {string} block - 区块名
 * @param {string} blockSuffix - 区块的可选后缀
 * @param {function} element - 创建元素大小检测器的函数
 * @param {string} modifier - 区块或元素的可选修饰符
 * @returns {string} 所生成的 BEM 类名
 */
function _bem(namespace, block, blockSuffix, element, modifier) {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}

export class NameSpace {
  constructor(block) {
    this.block = block
    this.namespace = defaultNameSpace
  }
  b(blockSuffix = '') {
    return _bem(this.namespace, this.block, blockSuffix, '', '')
  }
  e(element) {
    return _bem(this.namespace, this.block, '', element, '')
  }
  m(modifier) {
    return _bem(this.namespace, this.block, '', '', modifier)
  }
  be(blockSuffix = '', element = '') {
    return blockSuffix && element ? _bem(this.namespace, this.block, blockSuffix, element, '') : ''
  }
  em(element = '', modifier = '') {
    return element && modifier ? _bem(this.namespace, this.block, '', element, modifier) : ''
  }
  bm(blurSuffix = '', modifier = '') {
    return blurSuffix && modifier ? _bem(this.namespace, this.block, blurSuffix, '', modifier) : ''
  }
  bem(blockSuffix = '', element = '', modifier = '') {
    return blockSuffix && element && modifier ? _bem(this.namespace, this.block, blockSuffix, element, modifier) : ''
  }
  is(name, ...args) {
    const state = args.length >= 1 ? args[0] : true
    return name && state ? `${statePrefix}${name}` : ''
  }
  id(code) {
    return code ? this.b(code + '') : ''
  }
}

{
  /* <div :class="ns.b()">
<div :class="[ns.b('first'), 'mb20', 'w200']">11</div>
<div :class="ns.be('first', 'two')">222</div>
<div :class="ns.em('number', '1')">2222</div>
<div :class="ns.bem('b', 'e', 'm')">bem</div>
<div :class="ns.is('active')" @click="num++">3333</div>
<div :class="ns.is('active', num)">true</div>
</div> */
}
