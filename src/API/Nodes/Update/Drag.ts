import { NumberField } from "API/Fields/NumberField";
import { FrameRateMultiplier, LerpNumber } from "API/Lib";
import { NodeGroups } from "API/NodeGroup";
import { AutoGenDrag } from "../AutoGeneration/UpdateNodes/AutoGenDrag";
import { UpdateNode } from "./UpdateNode";
import { GetParticleData, ParticleData } from "API/ParticleService";

export const DragName = "Drag";
export const DragFieldNames = {
    drag: "drag",
};

export class Drag extends UpdateNode {
    nodeGroup: NodeGroups = NodeGroups.Update;
    nodeFields: {
        drag: NumberField;
    };

    constructor() {
        super();

        this.nodeFields = {
            drag: new NumberField(0),
        };
    }

    Update(data: ParticleData) {
        const drag = this.nodeFields.drag.GetNumber() * FrameRateMultiplier;
        const oldVelocity = data.velocityNormal;

        let [x, y, z] = [0, 0, 0];

        if (oldVelocity.X > 0 && oldVelocity.X - drag > 0) {
            x = oldVelocity.X - drag;
        } else if (oldVelocity.X < 0 && oldVelocity.X + drag < 0) {
            x = oldVelocity.X + drag;
        }

        if (oldVelocity.Y > 0 && oldVelocity.Y - drag > 0) {
            y = oldVelocity.Y - drag;
        } else if (oldVelocity.Y < 0 && oldVelocity.Y + drag < 0) {
            y = oldVelocity.Y + drag;
        }

        if (oldVelocity.Z > 0 && oldVelocity.Z - drag > 0) {
            z = oldVelocity.Z - drag;
        } else if (oldVelocity.Z < 0 && oldVelocity.Z + drag < 0) {
            z = oldVelocity.Z + drag;
        }

        data.velocityNormal = new Vector3(x, y, z);
    }

    GetNodeName(): string {
        return DragName;
    }

    GetAutoGenerationCode() {
        return AutoGenDrag(this);
    }
}
