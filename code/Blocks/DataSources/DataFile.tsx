import * as React from "react";
import {
  get,
  isEmpty,
  isNull,
  isString,
  isNumber,
  isBoolean,
  reduce,
  last
} from "lodash";
import { PropertyControls, ControlType } from "framer";
import { Store } from "../../store";
import { EmptyComponent } from "../Empty";
import { replacer } from "../../utils";

function valueFromProps(props: Props) {
  const { name, valueType } = props;
  return { [name]: props[`value_${valueType}`] };
}

interface Props {
  id: string;
  dataSources: React.ReactNode;
  field: string;
  file: string | null;
  height: string | number;
  path: string | void;
  showAdvanced: boolean;
  width: string | number;
}

interface State {
  data: object | void;
}

export class DataFile extends React.Component<Props, State> {
  static propertyControls: PropertyControls = {
    file: {
      type: ControlType.File,
      allowedFileTypes: ["json", "js"]
    },
    field: {
      type: ControlType.String,
      title: "Name",
      placeholder: "",
      defaultValue: ""
    },
    showAdvanced: {
      type: ControlType.Boolean,
      title: "Advanced",
      defaultValue: false,
      disabledTitle: "No",
      enabledTitle: "Yes"
    },
    path: {
      type: ControlType.String,
      title: "Path",
      placeholder: "e.g. data[0].products",
      defaultValue: "",
      hidden: props => !props.showAdvanced
    },
    dataSources: {
      type: ControlType.Array,
      propertyControl: {
        type: ControlType.ComponentInstance,
        title: "Data Source"
      }
    }
  };

  static defaultProps = {
    width: 320,
    height: 200
  };

  state = { data: null };

  update(data: any) {
    Store.set(this.props.id, data);
    this.setState({ data });
  }

  remove() {
    Store.remove(this.props.id);
    this.setState({ data: null });
  }

  loadFile() {
    fetch(this.props.file)
      .then(response => response.json())
      .then(data => this.update(data));
  }

  isFileEmpty() {
    const { file } = this.props;
    return isEmpty(file) || isEmpty(last(file.split("/")));
  }

  componentDidMount() {
    const { id } = this.props;

    if (!this.isFileEmpty()) this.loadFile();
  }

  componentDidUpdate(prevProps, prevState) {
    const { file, dataSources } = this.props;
    const prevIds = prevProps.dataSources.map(source => source.props.id);
    const ids = React.Children.map(dataSources, source => source.props.id);

    console.log("sources: ", prevIds, ids, dataSources, this.state);

    if (
      JSON.stringify(prevProps.dataSources, replacer(2), 0) !==
      JSON.stringify(this.props.dataSources, replacer(2), 0)
    ) {
      const childData = reduce(
        dataSources,
        (res, source) => {
          const { props } = source.props.children[0];
          console.log("vfp:", valueFromProps(props));
          return { ...res, ...valueFromProps(props) };
        },
        {}
      );
      console.log("CD: ", childData);
      this.update({ ...this.state.data, ...childData });
    }

    if (prevProps.file !== file) {
      if (this.isFileEmpty()) {
        this.remove();
      } else {
        this.loadFile();
      }
    }
  }

  debugInfo(context = null) {
    const { id, file } = this.props;
    const { data } = this.state;

    const debugData = {
      id,
      file,
      "Object.keys(Store)": Store.keys.join(", "),
      "Object.keys(this)": Object.keys(this).join(", "),
      "Object.keys(props)": Object.keys(this.props).join(", ")
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
    const { path } = this.props;
    const { data } = this.state;

    const showData = isEmpty(path) ? data : get(data, path, null);
    const json = JSON.parse(JSON.stringify(showData, replacer(0), 2));

    const jsonPretty = (obj: any, level = 0): string | React.ReactNode => {
      if (isString(obj)) return `'${obj}'`;
      if (isNumber(obj)) return obj;
      if (isBoolean(obj)) return obj ? "Yes" : "No";

      return Object.keys(obj).map(key => (
        <div
          key={`${key}:${obj[key]}`}
          style={{ paddingLeft: (level + 1) * 8 }}
        >
          {key}: {jsonPretty(obj[key], level + 1)}
        </div>
      ));
    };

    return (
      <div style={{ textAlign: "left", marginLeft: 24, maxHeight: 300 }}>
        <div>{"{"}</div>
        {jsonPretty(json)}
        <div>{"}"}</div>
      </div>
    );
  }

  getInfo(): { icon: string; title: string; info: string | React.ReactNode } {
    const { file } = this.props;
    const { data } = this.state;
    const fileName = isEmpty(file) ? null : last(file.split("/"));

    let info,
      icon = "database",
      title = fileName;

    if (this.isFileEmpty()) {
      title = "Select a file";
      icon = "upload";
    } else if (isNull(data)) {
      info = "Data is empty";
    } else {
      info = this.getJSONInfo();
    }

    return { icon, info, title };
  }

  render() {
    const { showAdvanced, height, width } = this.props;
    const { data } = this.state;

    const { icon, info, title } = this.getInfo();

    const flexDirection = isNull(data) ? "column" : "row";

    return (
      <React.Fragment>
        <EmptyComponent
          icon={icon}
          height={height}
          width={width}
          flexDirection={flexDirection}
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
