import * as React from "react";
import { get, isEmpty, isNull, isObject, last } from "lodash";
import { PropertyControls, ControlType } from "framer";
import { Store } from "../../store";
import { EmptyComponent } from "../Empty";
import { Context } from "../../override";
import { replacer } from "../../utils";

interface Props {
  id: string;
  file?: string;
  height: string | number;
  path: string | null;
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
    path: {
      type: ControlType.String,
      title: "Path",
      placeholder: "e.g. data[0].products",
      defaultValue: ""
    },
    showAdvanced: {
      type: ControlType.Boolean,
      title: "Advanced",
      defaultValue: false,
      disabledTitle: "No",
      enabledTitle: "Yes"
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
    const { file, id } = this.props;
    const data = Store.get(id);

    if (!isEmpty(data)) {
      this.update(data);
      return;
    }

    if (!this.isFileEmpty()) this.loadFile();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.file !== this.props.file) {
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
    const { path } = this.props;
    const { data } = this.state;

    const showData = isEmpty(path) ? data : get(data, path, null);
    const json = JSON.parse(JSON.stringify(showData, replacer(0), 2));
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
