import * as React from "react";
import { get, take } from "lodash";
import {
  ControlType,
  Frame,
  PropertyControls,
  Stack,
  StackAlignment,
  StackDirection,
  StackDistribution,
  StackProps,
  Scroll
} from "framer";

import { EmptyComponent } from "./Empty";
import { overrideDesign } from "../override";
import { Context } from "../override";
import { Store } from "../store";
import { replacer } from "../utils";

interface ListProps extends StackProps {
  alignment: StackAlignment;
  backgroundColor: string;
  dataSource: React.ReactChildren;
  direction: StackDirection;
  distribution: StackDistribution;
  emptyContent: React.ReactChildren;
  gap: number;
  height: number | string;
  padding: number;
  path: string;
  limit: number;
  reactKey: string;
  showEmpty: boolean;
  showAdvanced: boolean;
  width: number | string;
}

export class List extends React.Component<ListProps> {
  static defaultProps = {
    alignment: "left",
    direction: "vertical",
    distribution: "start",
    height: 400,
    width: 320,
    gap: 8,
    padding: 8
  };

  static propertyControls: PropertyControls = {
    path: {
      type: ControlType.String,
      placeholder: "e.g. images[0].src",
      title: "Path",
      defaultValue: ""
    },
    backgroundColor: {
      type: ControlType.Color,
      title: "Background"
    },
    showEmpty: {
      type: ControlType.Boolean,
      title: "Show empty?",
      defaultValue: true
    },
    reactKey: {
      type: ControlType.String,
      title: "Key",
      defaultValue: "id"
    },
    ...Stack.propertyControls,
    showAdvanced: {
      type: ControlType.Boolean,
      title: "Advanced",
      defaultValue: false,
      disabledTitle: "No",
      enabledTitle: "Yes"
    },
    limit: {
      type: ControlType.Number,
      min: 1,
      max: 30,
      defaultValue: 10,
      title: "Take first",
      hidden: props => React.Children.count(props.dataSource) !== 0
    },
    children: {
      type: ControlType.ComponentInstance,
      title: "Row"
    },
    emptyContent: {
      type: ControlType.ComponentInstance,
      title: "Empty content"
    },
    dataSource: {
      type: ControlType.ComponentInstance,
      title: "Data Source"
    }
  };

  getSizes({
    items,
    rowHeight,
    rowWidth
  }: {
    items: [];
    rowHeight: number;
    rowWidth: number;
  }): { stackHeight: number; stackWidth: number } {
    const { direction, gap, height, width } = this.props;

    let stackHeight, stackWidth;

    if (direction === "vertical") {
      const listHeight = (rowHeight + gap) * items.length;
      stackHeight = listHeight > height ? listHeight : height;
      stackWidth = width;
    } else {
      const listWidth = (rowWidth + gap) * items.length;
      stackWidth = listWidth > width ? listWidth : height;
      stackHeight = height;
    }

    return { stackHeight, stackWidth };
  }

  renderEmpty({
    message,
    icon = "list"
  }: {
    message: string;
    icon?: string;
  }): JSX.Element {
    const { emptyContent, height, width } = this.props;
    if (React.Children.count(emptyContent) !== 0) {
      const contentProps = {
        icon,
        message,
        width,
        height
      };
      return overrideDesign(emptyContent[0])(contentProps);
    }

    return (
      <EmptyComponent height={height} width={width} icon={icon}>
        {message}
      </EmptyComponent>
    );
  }

  renderContent(data): JSX.Element {
    const {
      alignment,
      backgroundColor,
      children,
      showAdvanced,
      distribution,
      direction,
      gap,
      height,
      limit,
      padding,
      reactKey,
      showEmpty,
      width
    } = this.props;

    if (React.Children.count(children) === 0) {
      return this.renderEmpty({ message: "Connect to a row" });
    }

    const component = children[0];
    const { height: rowHeight, width: rowWidth } = component.props;
    const style: Partial<React.CSSProperties> = { backgroundColor, padding };

    const items = take(Array.isArray(data) ? data : [data], limit);

    if (items.length === 0) {
      if (showEmpty) {
        return this.renderEmpty({
          message: "No items",
          icon: "inbox"
        });
      } else {
        return null;
      }
    }

    const { stackHeight, stackWidth } = this.getSizes({
      items,
      rowHeight,
      rowWidth
    });

    const scrollProps = { direction, height, width, overflow: "hidden" };
    const stackProps = {
      alignment,
      direction,
      distribution,
      gap,
      height: stackHeight,
      width: stackWidth,
      top: 0,
      left: 0
    };
    const stackFrameProps = {
      height: stackHeight,
      width: stackWidth,
      style,
      left: 0,
      top: 0
    };
    const contentProps = {
      height: rowHeight,
      width: rowWidth,
      left: 0,
      top: 0,
      style
    };
    const override = overrideDesign(component);

    return (
      <React.Fragment>
        <Scroll {...scrollProps}>
          <Frame {...stackFrameProps}>
            <Stack {...stackProps}>
              {items.map(item => (
                <Frame {...contentProps} key={item[reactKey]}>
                  {override({
                    ...item,
                    width:
                      direction === "vertical"
                        ? stackWidth - padding * 4
                        : rowWidth,
                    height:
                      direction === "horizontal"
                        ? stackHeight - padding * 4
                        : rowHeight
                  })}
                </Frame>
              ))}
            </Stack>
          </Frame>
        </Scroll>
        {showAdvanced && this.debugInfo()}
      </React.Fragment>
    );
  }

  debugInfo() {
    const dataSource = this.props.dataSource[0];

    const debugData = {
      "Object.keys(Store)": Store.keys.join(", "),
      source: dataSource ? dataSource.props.id : "--",
      data: dataSource
        ? JSON.stringify(Store.get(dataSource.props.id), replacer(0), 2)
        : "--"
    };

    return (
      <div style={styles.debug}>
        {Object.keys(debugData).map(key => (
          <div key={key}>
            <strong>{key}</strong>: {debugData[key]}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { dataSource, path } = this.props;

    // no DataSource attached, but there might be one above in the tree
    if (React.Children.count(dataSource) === 0) {
      return (
        <Context.Consumer>
          {data => this.renderContent(get(data, path) || [])}
        </Context.Consumer>
      );
    }

    // DataStore is attached, get this data from the Store
    const dataProvider = dataSource[0];
    const data = Store.get(dataProvider.props.id);
    return this.renderContent(get(data, path, []));
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  debug: {
    position: "absolute",
    bottom: -100,
    left: 0,
    backgroundColor: "#ceb",
    border: "1px #0099FF solid",
    fontSize: 12,
    padding: 16,
    textAlign: "left"
  }
};
