import { Accelerate } from "API/Nodes/Update/Accelerate";

export function AutoGenAccelerate(node: Accelerate) {
    const className = `Acceleration${node.id}`;
    const varName = `acceleration${node.id}`;

    let src = `local ${className} = TS.import(script, APIFolder, "Nodes", "Update", "Acceleration").Acceleration \n`;
    src += `local ${varName} = ${className}.new() \n`;

    src += node.nodeFields.acceleration.AutoGenerateField(`${varName}.nodeFields.acceleration`);

    src += `nodeSystem:AddNode(${varName})`;
    return src;
}
