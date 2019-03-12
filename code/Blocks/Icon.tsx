import * as React from "react";
import { FrameProps, PropertyControls, ControlType } from "framer";
import { get } from "lodash";
import { Context } from "../override";
import FeatherIcon from "feather-icons-react";

interface BlockProps extends FrameProps {
  color: string;
  defaultIcon: string;
  path: string;
}

export class Icon extends React.Component<BlockProps> {
  static propertyControls: PropertyControls = {
    path: {
      type: ControlType.String,
      placeholder: "e.g. images[0].src",
      title: "Path",
      defaultValue: ""
    },
    color: {
      type: ControlType.Color,
      title: "Color",
      defaultValue: "#000"
    },
    defaultIcon: {
      type: ControlType.String,
      placeholder: "icon name, e.g. flag",
      title: "Default",
      defaultValue: "settings"
    }
  };

  render() {
    const { color, defaultIcon, height, width, path } = this.props;

    return (
      <Context.Consumer>
        {(data: {}) => {
          const icon = get(data, path) || defaultIcon;

          return (
            <FeatherIcon
              icon={icon}
              width={width}
              height={height}
              color={color}
            />
          );
        }}
      </Context.Consumer>
    );
  }
}
