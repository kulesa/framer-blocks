import * as React from "react";
import FeatherIcon from "feather-icons-react";

export const Info = ({
  icon = "book-open",
  backgroundColor = "white",
  flexDirection = "column",
  justifyContent = "center",
  children,
  height,
  width,
  padding = 16
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
        backgroundColor,
        padding
      }}
    >
      {height > 80 && (
        <div style={styles.icon}>
          <FeatherIcon
            icon={icon}
            width={iconSize}
            height={iconSize}
            color='#000'
          />
        </div>
      )}
      {width > 150 && <div style={styles.message}>{message}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    borderRadius: 8,
    boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.25)",
    fontSize: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "left",
    minWidth: 300
  },
  icon: {},
  message: { fontSize: 24 }
};
