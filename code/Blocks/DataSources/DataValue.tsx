import * as React from "react";
import { get, isEmpty, isNull, some } from "lodash";
import { ControlType, addPropertyControls } from "framer";
import { Info } from "../Info";
import { replacer } from "../../utils";

import useStore from "../../store";

export interface DataValueProps {
  id: string;
  dataSources: React.ReactNode;
  height: string | number;
  name: string;
  advanced: boolean;
  value_boolean: boolean;
  value_number: number;
  value_string: string;
  valueType: string;
  width: string | number;
}

export function valueFromProps(props: DataValueProps) {
  const { name, valueType } = props;
  return { [name]: props[`value_${valueType}`] };
}

export function DataValue(props: DataValueProps) {
  const {
    id,
    name,
    valueType,
    value_boolean,
    value_number,
    value_string,
    advanced,
    height,
    width
  } = props;

  const data = useStore(state => state.getData(id));
  const set = useStore(state => state.setData(id));

  React.useEffect(() => {
    set(valueFromProps(props));
  }, [name, valueType, value_boolean, value_number, value_string]);

  function getJSONInfo() {
    if (isEmpty(name)) return "Name is missing";
    if (isNull(data)) return "Null";

    const json = JSON.stringify(data, replacer(0), 2);

    return (
      <div style={{ textAlign: "left", marginLeft: 24, maxHeight: 300 }}>
        {json}
      </div>
    );
  }

  function getInfo(): {
    icon: string;
    title: string;
    info: string | React.ReactNode;
  } {
    const icon = "database",
      title = name,
      info = getJSONInfo();

    return { icon, info, title };
  }

  const { icon, info, title } = getInfo();

  return (
    <Info
      icon={icon}
      height={height}
      width={width}
      flexDirection='row'
      justifyContent='space-between'
    >
      {title && <div style={styles.title}>{info || title}</div>}
    </Info>
  );
}

addPropertyControls(DataValue, {
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
  advanced: {
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
});

DataValue.defaultProps = {
  width: 300,
  height: 120
};

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
    fontWeight: 500
  },
  info: {
    fontSize: 16
  }
};
