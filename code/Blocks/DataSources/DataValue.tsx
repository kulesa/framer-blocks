import * as React from "react";
import { get, isEmpty, isNull, some } from "lodash";
import { PropertyControls, ControlType } from "framer";
import { Store } from "../../store";
import { EmptyComponent } from "../Empty";
import { replacer } from "../../utils";

interface Props {
  id: string;
  dataSources: React.ReactNode;
  height: string | number;
  name: string;
  path: string | void;
  showAdvanced: boolean;
  value_boolean: boolean;
  value_number: number;
  value_string: string;
  valueType: string;
  width: string | number;
}

interface State {
  data: object | void;
}

function valueFromProps(props: Props) {
  const { name, valueType } = props;
  return { [name]: props[`value_${valueType}`] };
}

export class DataValue extends React.Component<Props, State> {
  static propertyControls: PropertyControls = {
    valueType: {
      type: ControlType.Enum,
      title: "Type",
      options: ["boolean", "number", "string"],
      optionTitles: ["Boolean", "Number", "String"],
      defaultValue: "string"
    },
    name: {
      type: ControlType.String,
      title: "Name",
      placeholder: "",
      defaultValue: "myData"
    },
    value_boolean: {
      type: ControlType.Boolean,
      title: "Value",
      hidden: props => props.valueType !== "boolean"
    },
    value_number: {
      type: ControlType.Number,
      title: "Value",
      hidden: props => props.valueType !== "number"
    },
    value_string: {
      type: ControlType.String,
      title: "Value",
      hidden: props => props.valueType !== "string"
    },
    showAdvanced: {
      type: ControlType.Boolean,
      title: "Advanced",
      defaultValue: false,
      disabledTitle: "No",
      enabledTitle: "Yes"
    },
    dataSources: {
      type: ControlType.ComponentInstance,
      title: "Data Source"
    }
  };

  static defaultProps = {
    width: 320,
    height: 200
  };

  state = { data: null };

  constructor(props) {
    super(props);
    this.state = {
      data: valueFromProps(props)
    };
  }

  update(data: any) {
    Store.set(this.props.id, data);
    this.setState({ data });
  }

  remove() {
    Store.remove(this.props.id);
    this.setState({ data: null });
  }
  componentDidMount() {
    // const { id } = this.props;
    // const data = Store.get(id);
    // this.update(data);
  }

  componentDidUpdate(prevProps: Props) {
    const hasChanged = (attrs: string[]): boolean =>
      some(attrs.map(attr => prevProps[attr] !== this.props[attr]));

    if (
      hasChanged([
        "name",
        "valueType",
        "value_boolean",
        "value_number",
        "value_string"
      ])
    ) {
      this.update(valueFromProps(this.props));
    }
  }

  debugInfo(context = null) {
    const { id } = this.props;
    const { data } = this.state;

    const debugData = {
      id,
      "Object.keys(data)": get(data, "results", ["nope"]).join(", "),
      "Object.keys(Store)": Store.keys.join(", "),
      "Object.keys(this)": Object.keys(this).join(", "),
      "Object.keys(props)": Object.keys(this.props).join(", "),
      standalone: this.props.hasOwnProperty("_forwardedOverrides").toString()
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

  getJSONInfo() {
    const { name } = this.props;
    const { data } = this.state;

    if (isEmpty(name)) return "Name is missing";
    if (isNull(data)) return "Null";

    const json = JSON.parse(JSON.stringify(data, replacer(0), 2));

    return (
      <div style={{ textAlign: "left", marginLeft: 24, maxHeight: 300 }}>
        <div>{"{"}</div>
        {Object.keys(json).map(key => (
          <div key={`${key}:${json[key]}`}>
            &nbsp;&nbsp;{key}: {json[key]}
          </div>
        ))}
        <div>{"}"}</div>
      </div>
    );
  }

  getInfo(): { icon: string; title: string; info: string | React.ReactNode } {
    const { name, valueType } = this.props;
    const { data } = this.state;

    const icon = "git-merge",
      title = name,
      info = this.getJSONInfo();

    return { icon, info, title };
  }

  render() {
    const { showAdvanced, height, width } = this.props;
    const { data } = this.state;

    const { icon, info, title } = this.getInfo();

    return (
      <React.Fragment>
        <EmptyComponent
          icon={icon}
          height={height}
          width={width}
          flexDirection="row"
          justifyContent="space-evenly"
        >
          {title && <div style={styles.title}>{title}</div>}
          {info && (
            <div style={styles.info}>
              <code>{info}</code>
            </div>
          )}
        </EmptyComponent>
        {showAdvanced && this.debugInfo()}
      </React.Fragment>
    );
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: "white",
    fontSize: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  debug: {
    marginTop: 32,
    backgroundColor: "#ceb",
    border: "1px #0099FF solid",
    fontSize: 12,
    padding: 16,
    textAlign: "left"
  },
  title: {
    textAlign: "left",
    marginBottom: 16,
    marginLeft: 24,
    fontWeight: 500
  },
  info: {
    fontSize: 16
  }
};
