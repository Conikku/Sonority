import { UpdateParticleData } from "API/ParticleService";
import { NumberField } from "../../Fields/NumberField";
import { NodeGroups } from "../../NodeGroup";
import { AutoGenSetEmission } from "../AutoGeneration/InitializeNodes/AutoGenSetEmission";
import { InitializeNode } from "./InitializeNode";

export const SetEmissionName = "SetEmission";
export const SetEmissionFieldNames = {
    emission: "emission",
};

export class SetEmission extends InitializeNode {
    nodeGroup: NodeGroups = NodeGroups.Initialize;
    nodeFields: {
        emission: NumberField;
    };

    constructor() {
        super();

        this.nodeFields = {
            emission: new NumberField(1),
        };
    }

    Initialize(id: number) {
        UpdateParticleData(id, (data) => {
            data.emission = this.nodeFields.emission.GetNumber();
            return data;
        });
    }

    GetNodeName(): string {
        return SetEmissionName;
    }

    GetAutoGenerationCode() {
        return AutoGenSetEmission(this);
    }
}
