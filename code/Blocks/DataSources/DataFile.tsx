import * as React from "react";
import { get, isEmpty, map, last } from "lodash";
import { ControlType, addPropertyControls } from "framer";
import useStore from "../../store";
import { Info } from "../Info";
import { getChildrenHash, getChildrenIds, replacer } from "../../utils";

interface Props {
  id: string;
  dataSources: React.ReactNode;
  file: string | null;
  height: string | number;
  advanced: boolean;
  width: string | number;
}

export function DataFile(props: Props) {
  const { id, dataSources, file, height, width } = props;

  const data = useStore(state => state.getData(id));
  const set = useStore(state => state.setData(id));
  const [fileData, setFileData] = React.useState({});

  const isFileEmpty = isEmpty(file) || isEmpty(last(file.split("/")));

  React.useEffect(() => {
    if (!isFileEmpty) {
      fetch(file)
        .then(response => response.json())
        .then(fileData => setFileData(fileData));
    }
  }, [file]);

  const dataSourcesHash = getChildrenHash(dataSources);

  React.useEffect(() => {
    const childIds = getChildrenIds(dataSources);
    set(fileData, childIds);
  }, [fileData, dataSourcesHash]);

  const display = React.useMemo(() => {
    const fileName = isEmpty(file) ? null : last(file.split("/"));
    const flexDirection = isEmpty(data) ? "column" : "row";

    const [icon, title] = isFileEmpty
      ? ["upload", "Select a file"]
      : ["file", fileName];

    return (
      <Info
        icon={icon}
        height={height}
        width={width}
        flexDirection={flexDirection}
        justifyContent='space-evenly'
      >
        {title && <div style={styles.title}>{title}</div>}
      </Info>
    );
  }, [file, data]);

  return display;
}

addPropertyControls(DataFile, {
  file: {
    type: ControlType.File,
    allowedFileTypes: ["json", "js"]
  },
  advanced: {
    type: ControlType.Boolean,
    title: "Advanced",
    defaultValue: false,
    disabledTitle: "No",
    enabledTitle: "Yes"
  },
  dataSources: {
    type: ControlType.Array,
    propertyControl: {
      type: ControlType.ComponentInstance,
      title: "Data Source"
    }
  }
});

DataFile.defaultProps = {
  width: 320,
  height: 200
};

const styles: { [key: string]: React.CSSProperties } = {
  debug: {
    marginTop: 24,
    backgroundColor: "#55CCFF",
    borderRadius: 8,
    fontSize: 12,
    padding: 16,
    textAlign: "left",
    boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.25)",
    minWidth: 300
  },
  title: {
    textAlign: "left",
    marginLeft: 24,
    fontWeight: 500
  },
  info: {
    fontSize: 16
  }
};
