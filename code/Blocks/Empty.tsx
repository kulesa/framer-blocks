import * as React from "react";
import FeatherIcon from "feather-icons-react";

export const EmptyComponent = ({
  icon = "book-open",
  backgroundColor = "white",
  flexDirection = "column",
  justifyContent = "center",
  children,
  height,
  width
}) => {
  const iconSize = Math.min(height, width) / 3;
  const message = React.Children.count(children) > 0 ? children : "Empty";

  return (
    <div
      style={{
        ...styles.container,
        height,
        width,
        flexDirection,
        justifyContent,
        backgroundColor
      }}
    >
      {height > 80 && (
        <div style={styles.icon}>
          <FeatherIcon
            icon={icon}
            width={iconSize}
            height={iconSize}
            color="#000"
          />
        </div>
      )}
      {width > 150 && <div style={styles.message}>{message}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontSize: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  icon: {},
  message: { fontSize: 24 }
};
