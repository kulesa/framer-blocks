import * as React from "react";
import { isEmpty } from "lodash";
import { CanvasStore, FrameProps, Override, WithOverride } from "framer";

// redefining (simplified) canvas types because Framer library doesn't exeport them
export interface CanvasComponent extends React.ReactElement<FrameProps> {
  children: Array<CanvasComponent>;
  componentClass: string;
  name: string;
}

type Canvas = {
  children: Array<CanvasComponent>;
};

const canvas: Canvas = CanvasStore.shared().canvas;

const findCanvasComponent = (id: string): CanvasComponent =>
  canvas.children.find(component => component.props.id === id);

// pretty useless service class required because first argument of WithOverride needs a Component
// TODO: find a way to override without this proxy class
class OverrideWrapper extends React.Component<any> {
  render() {
    const { component, ...props } = this.props;
    return React.cloneElement(component, props);
  }
}

/**
 * Returns true if component accepts _forwardedOverrides prop
 *
 * @param componentClass Framer's internal componentClass on canvas
 */
function isOverridable(componentClass: string): boolean {
  return componentClass === "Text" || componentClass === "Image";
}

/**
 * Returns true if component is a wrapper of a code component
 *
 * @param componentClass Framer's internal componentClass on canvas
 */
function isCodeWrapper(componentClass: string): boolean {
  return componentClass === "ComponentContainer";
}

/**
 * Traverses components in the tree starting from the specified component,
 * and transforms props to a special internal prop that's later used to assign values
 * to nested Text and Image components.
 *
 * For example, if master component has a Text element named `title` with 'abc' as `id`:
 *
 *     getForwardedOverrides({title: 'My title'}) // {_forwardedOverrides: {abc: 'My title' }}
 *
 * Then each nested Text and Image component recevie this prop and selects it value by its id.
 *
 */
const getForwardedOverrides: Override = props => {
  const getOverrides = (
    overrides: { _forwardedOverrides: any },
    component: CanvasComponent
  ): Object => {
    if (!component) return overrides;

    const {
      children,
      componentClass,
      name,
      props: { id }
    } = component;
    let { _forwardedOverrides = {} } = overrides;

    if (isOverridable(componentClass)) {
      _forwardedOverrides[id] = props[name];
      return { ...overrides, _forwardedOverrides };
    } else if (isCodeWrapper(componentClass)) {
      const codeComponentId: string = children[0].props.id;
      const key = `id_${codeComponentId.split(".")[0]}`;
      _forwardedOverrides[key] = props[name];

      return {
        ...overrides,
        _forwardedOverrides
      };
    } else if (!isEmpty(children)) {
      const childrenOverrides = children.reduce(getOverrides, overrides);
      return { ...overrides, ...childrenOverrides };
    } else {
      // this is not suppose to happen, actually
      return overrides;
    }
  };

  const component: CanvasComponent = findCanvasComponent(props.id);
  const overrides = getOverrides({ _forwardedOverrides: {} }, component);
  return overrides;
};

export const Context = React.createContext({});

export const overrideDesign = (component: CanvasComponent) => (
  data
): React.ReactNode => (
  <Context.Provider value={data}>
    {WithOverride(component.type, getForwardedOverrides)({
      ...component.props,
      ...data,
      id: component.props.id,
      key: data.id,
      top: 0,
      left: 0
    })}
  </Context.Provider>
);
