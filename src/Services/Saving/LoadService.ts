import { HttpService } from "@rbxts/services";
import { NodeGroups } from "API/NodeGroup";
import { CreateEmptySystem } from "Components/Systems/CreateEmptySystem";
import { NodeList } from "Lists/NodesList";
import { SaveData, SerializedField } from "./SaveData";
import { NodeData, UpdateNodeAnchorPoint } from "Services/NodesService";
import { API_VERSION } from "API/ExportAPI";

// TODO: load connections 💀💀💀

const Selection = game.GetService("Selection");
let mismatchLoadTime = 0;
const MISMATCH_LOAD_TIMEFRAME = 10;

export function LoadFromFile() {
	const selection = Selection.Get();

	if (selection.size() === 0) {
		warn("Please select a file to load from.");
		return;
	}

	if (selection.size() > 1) {
		warn("Please select only one file to load from.");
		return;
	}

	const selectedInstance = selection[0];
	if (selectedInstance.IsA("ModuleScript") === false) {
		warn("Please select a valid file to load from.");
		return;
	}

	const data = HttpService.JSONDecode((selectedInstance as ModuleScript).Source) as SaveData;

	if (data.version !== API_VERSION && os.clock() - mismatchLoadTime > MISMATCH_LOAD_TIMEFRAME) {
		warn(
			"The file you are trying to load was created with an older version of the plugin. The vfx may not load correctly. Press the load button again to attempt to load the vfx.",
		);

		mismatchLoadTime = os.clock();
		return;
	}

	mismatchLoadTime = 0;

	for (const system of data.systems) {
		const anchorPoint = new Vector2(system.anchorPoint.x, system.anchorPoint.y);
		const systemData = CreateEmptySystem(anchorPoint);

		systemData.finishedBindingGroups.Connect(() => {
			for (const [group, nodes] of pairs(system.groups)) {
				let nodeGroup = NodeGroups.Spawn;

				if (group === "initialize") {
					nodeGroup = NodeGroups.Initialize;
				} else if (group === "update") {
					nodeGroup = NodeGroups.Update;
				} else if (group === "render") {
					nodeGroup = NodeGroups.Render;
				}

				for (const node of nodes) {
					const nodeData = CreateNode(nodeGroup, node.nodeName, node.fields);

					nodeData.elementLoaded.Connect(() => {
						systemData.addToNodeGroup[nodeGroup]!(nodeData.id);
					});
				}
			}
		});
	}

	for (const node of data.floatingNodes) {
		const nodeData = CreateNode(node.nodeGroup, node.nodeName, node.fields);
		UpdateNodeAnchorPoint(nodeData.id, new Vector2(node.anchorPoint.x, node.anchorPoint.y));
	}
}

function CreateNode(group: NodeGroups, nodeName: string, fields: SerializedField[]): NodeData {
	const nodeData = NodeList[group][nodeName].create!() as NodeData;

	for (const field of fields) {
		nodeData.node.nodeFields[field.name].ReadSerializedData(field.data);
	}

	return nodeData;
}
