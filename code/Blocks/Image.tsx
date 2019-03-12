import * as React from "react";
import { FrameProps, PropertyControls, ControlType } from "framer";
import { get, isEmpty, isString } from "lodash";
import { Context } from "../override";
import { EmptyComponent } from "./Empty";

interface BlockProps extends FrameProps {
  backgroundColor: string;
  objectFit: "none" | "fill" | "contain" | "cover" | "scale-down";
  path: string;
}

export class Image extends React.Component<BlockProps> {
  static propertyControls: PropertyControls = {
    path: {
      type: ControlType.String,
      placeholder: "e.g. images[0].src",
      title: "Path",
      defaultValue: ""
    },
    backgroundColor: {
      type: ControlType.Color,
      title: "Background",
      defaultValue: "#DEDEDE"
    },
    objectFit: {
      type: ControlType.Enum,
      options: ["none", "fill", "contain", "cover", "scale-down"],
      defaultValue: "none"
    }
  };

  render() {
    const { backgroundColor, height, width, objectFit, path } = this.props;

    return (
      <Context.Consumer>
        {(data: {}) => {
          const value = get(data, path);

          if (isEmpty(value)) {
            return (
              <EmptyComponent
                backgroundColor={backgroundColor}
                height={height}
                width={width}
                icon="image"
              >
                {width} x {height}
              </EmptyComponent>
            );
          }

          if (!isString(value)) {
            return (
              <EmptyComponent
                backgroundColor={backgroundColor}
                height={height}
                width={width}
                icon="image"
              >
                value at '{path}' is not a string
              </EmptyComponent>
            );
          }

          return <img src={value} style={{ height, width, objectFit }} />;
        }}
      </Context.Consumer>
    );
  }
}
