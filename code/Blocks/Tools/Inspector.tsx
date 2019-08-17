import * as React from "react";
import { get, isNull, isEmpty, isString, isNumber, isBoolean } from "lodash";
import { ControlType, addPropertyControls, Frame, FrameProps } from "framer";
import { Info } from "../Info";
import useStore from "../../store";
import { getChildrenIds } from "../../utils";

type DataInfoProps = {
  id: string;
  dataSourceId: string;
  showLevels: number;
};

function DataInfo(props: DataInfoProps) {
  const { id, dataSourceId, showLevels } = props;
  const datas = useStore(state => state.data);
  const data = useStore(state => state.getData(dataSourceId));

  const jsonPretty = (obj: any, level = 0): string | React.ReactNode => {
    if (isString(obj)) return `'${obj}'`;
    if (isNumber(obj)) return obj;
    if (isBoolean(obj)) return obj ? "Yes" : "No";
    if (level > showLevels) {
      return isEmpty(obj) ? `${obj}` : "{...}";
    }

    return Object.keys(obj).map(key => (
      <div key={`${key}:${data[key]}`} style={{ paddingLeft: (level + 1) * 8 }}>
        <span style={styles.key}>{key}:</span>&nbsp;
        {jsonPretty(obj[key], level + 1)}
      </div>
    ));
  };

  const content = React.useMemo(() => jsonPretty(data), [data]);

  return (
    <React.Fragment>
      <div>{"{"}</div>
      <code>{content}</code>
      <div>{"}"}</div>
    </React.Fragment>
  );
}

type Props = Partial<FrameProps> & {
  id: string;
  dataSource: React.ReactNode;
  showLevels: number;
  scroll: number;
  fontSize: number;
};

export function Inspector(props: Props) {
  const {
    backgroundColor,
    color,
    dataSource,
    fontSize,
    id,
    scroll,
    showLevels,
    ...rest
  } = props;
  const [dataSourceId, setDataSourceId] = React.useState();

  React.useEffect(() => {
    if (isEmpty(dataSource)) {
      setDataSourceId(null);
    } else {
      setDataSourceId(getChildrenIds(dataSource)[0]);
    }
  }, [dataSource]);

  // height of the output, used for scrolling
  const [offset, setOffset] = React.useState(0);
  const ref = React.useRef(null);

  // set negative top margin to visually scroll content
  React.useEffect(() => {
    if (ref.current) {
      setOffset(scroll > 0 ? -(ref.current.clientHeight / 1000) * scroll : 0);
    }
  });

  return dataSourceId ? (
    <Frame
      style={{ ...styles.container, fontSize }}
      overflow='hidden'
      color={color}
      backgroundColor={backgroundColor}
      {...rest}
    >
      <div style={{ marginTop: offset }} ref={ref}>
        <DataInfo id={id} dataSourceId={dataSourceId} showLevels={showLevels} />
      </div>
    </Frame>
  ) : (
    <Info
      icon='search'
      height={props.height}
      width={props.width}
      flexDirection='row'
      justifyContent='space-evenly'
    >
      Connect to a data source
    </Info>
  );
}

addPropertyControls(Inspector, {
  showLevels: {
    type: ControlType.Number,
    title: "Show levels",
    defaultValue: 0,
    min: 0,
    max: 5
  },
  scroll: {
    type: ControlType.Number,
    title: "Scroll to",
    defaultValue: 0,
    min: 0,
    max: 1000,
    hidden: props => {
      return false;
    }
  },
  dataSource: {
    type: ControlType.ComponentInstance,
    title: "Data Source"
  },
  fontSize: {
    title: "Size",
    type: ControlType.Number,
    min: 0,
    step: 2,
    displayStepper: true,
    defaultValue: 24
  },
  color: {
    title: "Color",
    type: ControlType.Color,
    defaultValue: "#FFEE66"
  },
  background: {
    title: "Background",
    type: ControlType.Color,
    defaultValue: "#333333"
  }
});

Inspector.defaultProps = {
  width: 600,
  height: 400
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    borderRadius: 8,
    textAlign: "left",
    boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.25)",
    border: "2px #999 solid",
    padding: 16
  },
  info: {
    height: "100%",
    width: "100%"
  },
  key: {
    fontWeight: 800
  }
};
