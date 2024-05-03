import Roact from "@rbxts/roact";
import { Vector2Field as Vector2FieldAPI } from "API/Fields/Vector2Field";
import { BasicTextLabel } from "Components/Basic/BasicTextLabel";
import { NumberInput } from "Components/Basic/NumberInput";
import ConnectionPointIn from "Components/Connections/ConnectionPointIn";
import Div from "Components/Div";
import { GetZoomScale } from "ZoomScale";

interface Props {
	NodeId: number;
	NodeField: Vector2FieldAPI;
	NodeFieldName: string;

	Label?: string;
	ValueLabels?: [string, string];
	TextToInputRatios?: [number, number];

	AllowConnections?: [boolean, boolean];
}

export function Vector2Field({
	NodeField,
	NodeId,
	NodeFieldName,
	Label = undefined,
	ValueLabels = ["X", "Y"],
	TextToInputRatios = [0.15, 0.15],
	AllowConnections = [true, true],
}: Props) {
	const zoomScale = GetZoomScale();

	return (
		<Div Size={UDim2.fromScale(1, 0)} AutomaticSize="Y">
			{Label !== undefined && <uilistlayout FillDirection="Vertical" Padding={new UDim(0, 5 * zoomScale)} />}
			{Label !== undefined && <BasicTextLabel Size={new UDim2(0.5, 0, 0, 20)} Text={Label} />}

			<Div Size={UDim2.fromScale(1, 0)} AutomaticSize="Y">
				<uilistlayout FillDirection="Vertical" Padding={new UDim(0, 5 * zoomScale)} />
				{Label !== undefined && <uipadding PaddingLeft={new UDim(0, 10 * zoomScale)} />}

				<Div Size={UDim2.fromScale(1, 0)} AutomaticSize="Y">
					<uilistlayout
						FillDirection="Horizontal"
						VerticalAlignment={"Center"}
						Padding={new UDim(0, 5 * zoomScale)}
					/>

					{AllowConnections[0] && (
						<ConnectionPointIn
							NodeId={NodeId}
							NodeFieldName={NodeFieldName}
							BindFunction={NodeField.BindX}
							UnbindFunction={NodeField.UnbindX}
						/>
					)}
					<Div Size={new UDim2(1, AllowConnections[0] ? -19 * zoomScale : 0, 0, 0)} AutomaticSize="Y">
						<BasicTextLabel
							Size={new UDim2(TextToInputRatios[0], 0, 0, 20)}
							Text={ValueLabels[0]}
							TextYAlignment="Bottom"
						/>
						<NumberInput
							AnchorPoint={new Vector2(1, 0)}
							Position={UDim2.fromScale(1, 0)}
							Size={new UDim2(1 - TextToInputRatios[0], 0, 0, 20)}
							Text={() => tostring(NodeField.GetX())}
							AllowNegative={true}
							NumberChanged={NodeField.SetX}
						/>
					</Div>
				</Div>
				<Div Size={UDim2.fromScale(1, 0)} AutomaticSize="Y">
					<uilistlayout
						FillDirection="Horizontal"
						VerticalAlignment={"Center"}
						Padding={new UDim(0, 5 * zoomScale)}
					/>

					{AllowConnections[1] && (
						<ConnectionPointIn
							NodeId={NodeId}
							NodeFieldName={NodeFieldName}
							BindFunction={NodeField.BindY}
							UnbindFunction={NodeField.UnbindY}
						/>
					)}
					<Div Size={new UDim2(1, AllowConnections[1] ? -19 * zoomScale : 0, 0, 0)} AutomaticSize="Y">
						<BasicTextLabel
							Size={new UDim2(TextToInputRatios[1], 0, 0, 20)}
							Text={ValueLabels[1]}
							TextYAlignment="Bottom"
						/>
						<NumberInput
							AnchorPoint={new Vector2(1, 0)}
							Position={UDim2.fromScale(1, 0)}
							Size={new UDim2(1 - TextToInputRatios[1], 0, 0, 20)}
							Text={() => tostring(NodeField.GetY())}
							AllowNegative={true}
							NumberChanged={NodeField.SetY}
						/>
					</Div>
				</Div>
			</Div>
		</Div>
	);
}
