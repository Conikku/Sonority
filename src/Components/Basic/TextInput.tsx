import React, { useEffect, useRef } from "@rbxts/react";
import { StyleColors, StyleProperties, StyleText } from "Style";
import { GetZoomScale } from "ZoomScale";

interface Props {
    AnchorPoint?: Vector2;
    Position?: UDim2;
    Size?: UDim2;

    HideBackground?: boolean;

    FontWeight?: Enum.FontWeight;
    TextSize?: number;
    TextColor?: Color3;
    TextXAlignment?: Enum.TextXAlignment;
    PlaceholderText?: string;
    Text?: string | (() => string);

    ClearTextOnFocus?: boolean;
    AutoFocus?: boolean;
    IsAffectedByZoom?: boolean;

    Disabled?: boolean;
    TextChanged?: (text: string) => string | void;
    LostFocus?: (text: string) => string | void;
    GetRef?: (textBox: TextBox) => void;
}

export function TextInput({
    AnchorPoint = Vector2.zero,
    Position = UDim2.fromScale(0, 0),
    Size = UDim2.fromScale(1, 1),
    HideBackground = false,
    TextSize = StyleText.FontSize,
    FontWeight = StyleText.FontWeight,
    TextColor = StyleColors.TextDark,
    TextXAlignment = Enum.TextXAlignment.Left,
    Text = "",
    ClearTextOnFocus = true,
    AutoFocus = false,
    IsAffectedByZoom = true,
    Disabled = false,
    TextChanged = undefined,
    LostFocus = undefined,
    GetRef = undefined,
    children,
}: React.PropsWithChildren<Props>) {
    const textBoxRef = useRef<TextBox>();
    const textLabelRef = useRef<TextLabel>();

    const zoomScale = IsAffectedByZoom ? GetZoomScale() : 1;

    const getText = () => {
        if (typeIs(Text, "function")) {
            return Text();
        }

        return Text;
    };

    useEffect(() => {
        if (textBoxRef.current === undefined) return;

        let textChangedConnection: RBXScriptConnection;
        let focusLostConnection: RBXScriptConnection;

        if (GetRef !== undefined) {
            GetRef(textBoxRef.current);
        }

        if (!Disabled) {
            textChangedConnection = textBoxRef.current.GetPropertyChangedSignal("Text").Connect(() => {
                let text = textBoxRef.current!.Text;
                if (text === " ") {
                    text = "";
                }

                if (text.sub(1, 1) === " ") {
                    text = text.sub(2);
                }

                textLabelRef.current!.Text = text;

                if (TextChanged === undefined) return;

                const newText = TextChanged(textLabelRef.current!.Text);
                if (newText !== undefined && newText !== textLabelRef.current!.Text) {
                    textLabelRef.current!.Text = newText;
                }
            });

            focusLostConnection = textBoxRef.current.FocusLost.Connect(() => {
                if (LostFocus === undefined) return;

                const newText = LostFocus(textBoxRef.current!.Text);
                if (newText !== undefined && newText !== textBoxRef.current!.Text) {
                    textBoxRef.current!.Text = newText;
                }
            });
        }

        if (AutoFocus && !Disabled) {
            textBoxRef.current.CaptureFocus();
        }

        return () => {
            if (textChangedConnection !== undefined) {
                textChangedConnection.Disconnect();
            }

            if (focusLostConnection !== undefined) {
                focusLostConnection.Disconnect();
            }
        };
    }, [textBoxRef.current, textLabelRef.current, Disabled]);

    // hacky scuffed annoying just to separate user input from code input; also removes cursor, yay
    return (
        <textbox
            AnchorPoint={AnchorPoint}
            Position={Position}
            Size={IsAffectedByZoom ? new UDim2(Size.X.Scale, Size.X.Offset, Size.Y.Scale, Size.Y.Offset * zoomScale) : Size}
            BackgroundColor3={Disabled ? StyleColors.Disabled : StyleColors.Highlight}
            BackgroundTransparency={HideBackground ? 1 : 0}
            BorderSizePixel={0}
            ClearTextOnFocus={Disabled ? false : ClearTextOnFocus}
            TextEditable={!Disabled}
            TextSize={IsAffectedByZoom ? TextSize * zoomScale : TextSize}
            TextColor3={Disabled ? StyleColors.TextLight : TextColor}
            FontFace={new Font(StyleText.FontId, FontWeight)}
            TextXAlignment={TextXAlignment}
            TextWrapped={true}
            TextTransparency={1}
            TextTruncate={Enum.TextTruncate.AtEnd}
            Text={" "}
            ref={textBoxRef}
        >
            <uipadding PaddingLeft={new UDim(0, math.clamp(5 * zoomScale, 1, math.huge))} />
            <uicorner CornerRadius={StyleProperties.CornerRadius} />
            <textlabel
                Size={UDim2.fromScale(1, 1)}
                BackgroundTransparency={1}
                TextSize={IsAffectedByZoom ? TextSize * zoomScale : TextSize}
                FontFace={new Font(StyleText.FontId, FontWeight)}
                TextColor3={Disabled ? StyleColors.TextLight : TextColor}
                TextXAlignment={TextXAlignment}
                TextWrapped={true}
                Text={Disabled ? "-" : getText()}
                TextTruncate={Enum.TextTruncate.AtEnd}
                ref={textLabelRef}
            />

            {children}
        </textbox>
    );
}
