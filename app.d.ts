import {As, RightJoinProps} from "@chakra-ui/system/dist/system.types";


declare module "@chakra-ui/system" {

    type MergeWithAs<ComponentProps extends object, AsProps extends object, AdditionalProps extends object = {}, AsComponent extends any> = (RightJoinProps<ComponentProps, AdditionalProps> | RightJoinProps<AsProps, AdditionalProps>) & {
        as?: AsComponent;
    };
}
