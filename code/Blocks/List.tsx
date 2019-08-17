import * as React from "react"
import { get, pick, take } from "lodash"
import {
    addPropertyControls,
    ControlType,
    Frame,
    Stack,
    StackProperties,
    Scroll,
} from "framer"

import { Info } from "./Info"
import useStore from "../store"
import { getChildrenIds } from "../utils"

const stackPropertyControls: Array<ControlType> = Stack.propertyControls

type Props = Partial<StackProperties> & {
    backgroundColor: string
    dataSource: React.ReactChildren
    emptyContent: React.ReactChildren
    path: string
    limit: number
    reactKey: string
    responsive: boolean
    width: number | string
}

const booleanTitles = {
    disabledTitle: "No",
    enabledTitle: "Yes",
}

export function List(props: Props) {
    const {
        id,
        alignment,
        backgroundColor,
        children,
        dataSource,
        path,
        distribution,
        limit,
        reactKey,
        direction,
        emptyContent,
        gap,
        responsive,
        height,
        width,
        padding,
        paddingPerSide,
    } = props

    const [dataProviderId, setDataProviderId] = React.useState(id)
    const source = useStore(state => state.getData(dataProviderId))

    const dataSourceId = getChildrenIds(dataSource)[0] || id
    const data = get(source, path, [])
    React.useEffect(() => {
        setDataProviderId(dataSourceId)
    }, [dataSourceId])

    function getStackSize({
        items,
        rowHeight,
        rowWidth,
    }: {
        items: []
        rowHeight: number
        rowWidth: number
    }): { stackHeight: number; stackWidth: number } {
        let stackHeight, stackWidth

        if (direction === "vertical") {
            const listHeight = (rowHeight + gap) * items.length
            stackHeight = listHeight > height ? listHeight : height
            stackWidth = responsive ? width : rowWidth
        } else {
            const listWidth = (rowWidth + gap) * items.length
            stackWidth = listWidth > width ? listWidth : height
            stackHeight = responsive ? height : rowHeight
        }

        return { stackHeight, stackWidth }
    }

    // always use side paddings
    function getPaddings() {
        const defaultPadding = paddingPerSide ? 0 : padding
        const sidePaddings = [
            "paddingLeft",
            "paddingRight",
            "paddingTop",
            "paddingBottom",
        ].reduce(
            (res, key) => ({
                ...res,
                [key]: paddingPerSide
                    ? get(props, key, defaultPadding)
                    : padding,
            }),
            {}
        )

        return {
            padding: 0,
            paddingPerSide: false,
            ...sidePaddings,
        }
    }

    function renderEmpty({
        message,
        icon = "list",
    }: {
        message: string
        icon?: string
    }): React.ReactNode {
        if (React.Children.count(emptyContent) !== 0) {
            const contentProps = {
                icon,
                message,
                width,
                height,
            }
            return React.cloneElement(emptyContent[0], contentProps)
        }

        return (
            <Info height={height} width={width} icon={icon}>
                {message}
            </Info>
        )
    }

    if (React.Children.count(children) === 0) {
        return renderEmpty({ message: "Connect to a row" })
    }

    const component = children[0]
    const { height: rowHeight, width: rowWidth } = component.props

    const items = take(Array.isArray(data) ? data : [data], limit)

    if (items.length === 0) {
        return renderEmpty({
            message: "No items",
            icon: "inbox",
        })
    }

    const { stackHeight, stackWidth } = getStackSize({
        items,
        rowHeight,
        rowWidth,
    })

    const paddings = getPaddings()

    const paddingX: number = paddings.paddingLeft + paddings.paddingRight
    const paddingY: number = paddings.paddingTop + paddings.paddingBottom

    const stackProps = {
        alignment,
        direction,
        distribution,
        gap,
        ...paddings,
        height: stackHeight - paddingY,
        width: "100%",
        left: direction === "horizontal" ? paddings.paddingLeft : 0,
        top: direction === "vertical" ? paddings.paddingTop : 0,
        style: { backgroundColor },
    }
    const stackFrameProps = {
        height: stackHeight,
        width: stackWidth,
        style: { backgroundColor },
        top: 0,
        left: 0,
    }

    const contentSize = {
        width:
            direction === "vertical" && responsive
                ? stackWidth - paddingX
                : rowWidth,
        height:
            direction === "horizontal" && responsive
                ? stackHeight - paddingY
                : rowHeight,
    }
    const contentProps = {
        left: 0,
        top: 0,
        style: { backgroundColor },
        ...contentSize,
    }

    return (
        <Scroll
            direction={direction}
            height={height}
            width={width}
            overflow="hidden"
        >
            <Frame {...stackFrameProps}>
                <Stack {...stackProps}>
                    {items.map(item => (
                        <Frame {...contentProps} key={item[reactKey]}>
                            {React.cloneElement(component, {
                                ...item,
                                ...contentSize,
                            })}
                        </Frame>
                    ))}
                </Stack>
            </Frame>
        </Scroll>
    )
}

List.defaultProps = {
    height: 400,
    width: 320,
    gap: 8,
    padding: 8,
}

addPropertyControls(List, {
    path: {
        type: ControlType.String,
        placeholder: "e.g. images[0].src",
        title: "Path",
        defaultValue: "",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
    },
    responsive: {
        type: ControlType.Boolean,
        title: "Responsive",
        defaultValue: true,
        ...booleanTitles,
    },
    reactKey: {
        type: ControlType.String,
        title: "Key",
        defaultValue: "id",
    },
    ...stackPropertyControls,
    limit: {
        type: ControlType.Number,
        min: 1,
        max: 30,
        defaultValue: 10,
        title: "Take first",
        hidden: props => React.Children.count(props.dataSource) !== 0,
    },
    emptyContent: {
        type: ControlType.ComponentInstance,
        title: "Empty content",
    },
    dataSource: {
        type: ControlType.ComponentInstance,
        title: "Data Source",
    },
})

const styles: { [key: string]: React.CSSProperties } = {
    debug: {
        position: "absolute",
        bottom: -100,
        left: 0,
        backgroundColor: "#ceb",
        border: "1px #0099FF solid",
        fontSize: 12,
        padding: 16,
        textAlign: "left",
    },
}
