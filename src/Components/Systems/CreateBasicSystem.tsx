import { CreateConstantSpawn } from "Components/Nodes/Spawn/ConstantSpawn";
import { CreateEmptySystem } from "./CreateEmptySystem";
import { CreateSetLifetime } from "Components/Nodes/Initialize/SetLifetime";
import { CreateParticlePlane } from "Components/Nodes/Render/ParticlePlane";
import { NodeGroups } from "API/NodeGroup";
import { CreateSetPosition } from "Components/Nodes/Initialize/SetPosition";
import { SetPosition } from "API/Nodes/Initialize/SetPosition";

export function CreateBasicSystem() {
	const systemData = CreateEmptySystem();

	systemData.finishedBindingGroups.Connect(() => {
		const constantSpawnNode = CreateConstantSpawn();
		constantSpawnNode.elementLoaded.Connect(() => {
			systemData.addToNodeGroup[NodeGroups.Spawn]!(constantSpawnNode.id);
		});

		const lifetimeNode = CreateSetLifetime();
		lifetimeNode.elementLoaded.Connect(() => {
			systemData.addToNodeGroup[NodeGroups.Initialize]!(lifetimeNode.id);
		});

		const positionNode = CreateSetPosition();
		(positionNode.node as SetPosition).nodeFields.position.SetY(5);
		positionNode.elementLoaded.Connect(() => {
			systemData.addToNodeGroup[NodeGroups.Initialize]!(positionNode.id);
		});

		const particlePlaneNode = CreateParticlePlane();
		particlePlaneNode.elementLoaded.Connect(() => {
			systemData.addToNodeGroup[NodeGroups.Render]!(particlePlaneNode.id);
		});
	});

	return systemData;
}
