import ResizeTextarea from "react-textarea-autosize";
import {ComponentProps} from "react";

export interface IProps extends ComponentProps<typeof ResizeTextarea> {}
function ResizeTextareaApp(props: IProps) {
    return <ResizeTextarea {...props} minRows={1} maxRows={7}/>
}

export default ResizeTextareaApp
