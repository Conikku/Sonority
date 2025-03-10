import React, { useEffect, useRef, useState } from "@rbxts/react";
import { CalculationType1 } from "API/Nodes/FieldStates";
import { IsAxisX, IsAxisY, IsAxisZ } from "API/Nodes/FieldStatesLib";
import { Velocity as VelocityAPI } from "API/Nodes/Mixed/Velocity";
import ConnectableNumberField from "Components/NodeFields/ConnectableNumberField";
import ConnectableVector3Field from "Components/NodeFields/ConnectableVector3Field";
import StateField from "Components/NodeFields/StateField";
import { AddNode, type NodeData } from "Services/NodesService";
import Node from "../Node";

export function CreateVelocity() {
    return AddNode(new VelocityAPI(), (data: NodeData) => {
        return (
            <Velocity
                key={data.node.updateOrder === -1 ? `node_${data.node.id}` : `node_${data.node.updateOrder}_${data.node.id}`}
                data={data}
            />
        );
    });
}

function Velocity({ data }: { data: NodeData }) {
    const [_, setForceRender] = useState(0);

    const calculationTypeRef = useRef((data.node as VelocityAPI).nodeFields.calculationType);
    const axisTypeRef = useRef((data.node as VelocityAPI).nodeFields.axisType);

    useEffect(() => {
        const connection1 = calculationTypeRef.current.FieldChanged.Connect(() => {
            task.wait();
            setForceRender((prev) => prev + 1);
        });

        const connection2 = axisTypeRef.current.FieldChanged.Connect(() => {
            task.wait();
            setForceRender((prev) => prev + 1);
        });

        return () => {
            connection1.Disconnect();
            connection2.Disconnect();
        };
    }, []);

    const isUniform = () => {
        return calculationTypeRef.current.GetState() === CalculationType1.Uniform;
    };

    const isRandom = () => {
        return calculationTypeRef.current.GetState() === CalculationType1.Random;
    };

    const axisType = axisTypeRef.current.GetState();

    return (
        <Node
            Name="Velocity"
            NodeId={data.node.id}
            NodeAnchorPoint={data.anchorPoint}
            IsConnectedToSystem={data.node.connectedSystemId !== undefined}
        >
            <StateField NodeField={(data.node as VelocityAPI).nodeFields.nodeOperationType} />
            <ConnectableVector3Field
                NodeId={data.node.id}
                NodeField={(data.node as VelocityAPI).nodeFields.velocity}
                NodeFieldName={"vector3"}
                Label={"Vector3"}
             />
        </Node>
    );
}
