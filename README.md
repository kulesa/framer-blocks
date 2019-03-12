# framer-blocks

**`framer-blocks`** is an experimental set of components that can use data from shared data sources and pass data down the component tree.

## Components

Right now Blocks just a few components to demonstrate how different blocks can work together and pass props down to other linked Blocks and Framer components.

-**`DataFile`**: a data provider for Block components. Lads data from a JSON file passes data to linked components. Right now it can be connected to the List component only, but the plan is to allow to connect data to any Block component. So far that's the only data source, plans are to add more for REST and GraphQL APIs.

-**`List`**: works as a wrapper around Framer's `Stack`. Uses connected `Row` component to render each item in the list.

-**`Image`**: Image component with a `placeholder`, `origin-fit`, and other image properties.

-**`Icon`**: Block wrapper over `feather-icons-react`

-**`Empty`**: special component that takes `message` and `icon` props and outouts some information. You can redefine how it renders by attaching a code component!

# Usage

- Add a data source to canvas (right now only `DataFile` component is available),
- Add a `List` component and connect it to DataFile,
- Use `Path` setting on the list to specify path in the JSON data object. All Block components have `Path` setting that they use to pick data from the parent or data source. See format in the description of [Lodash's get function](https://lodash.com/docs/4.17.11#get)
- Link list to a design component.
- Add nested `Text` components. To allow text to receive data from Blocks, name it as a data field in your data in design component settings.
- Add nested Block components to your nested design components. Use `path` setting to map Blocks to data.
- Keep nesting components if it feels like it.

## Known Issues

This libary is experimental, hacky, and uses undocumented Framer features, so expect some things to not be perfect.

The most common issue you'll probably face is when you made some changes, but a Block component on canvas or in preview doesn't change. When this happens, try the following:

1. Check that you've specified `Path` property on a Block component correctly. Chances are you're trying to map component to a wrong data.

2. Change focus to other component and back. It'll cause the component to re-render.

3. Try to zoom in. Each component that is visible on canvas has a rendering timeout, and the more components are visible, the less timeout for each individual component. Zooming out causes slow components to time out and Framer just keeps showing their previous state, so you'll never figure out something is wrong.

4. If it still doesn't work, move components around, then if it doesn't help, close and open preview, close and open Framer, restart Mac OS, and maybe go for a walk; it's not worth it. But seriously, create an issue and we'll try to fix it.
