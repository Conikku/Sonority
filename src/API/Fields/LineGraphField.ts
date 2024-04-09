import { IdPool } from "API/IdPool";
import { LerpNumber } from "API/Lib";
import { NodeField } from "./NodeField";

export interface GraphPoint {
	id: number;
	time: number;
	value: number;
}

interface SerializedPoint {
	time: number;
	value: number;
}

interface SerializedData {
	startPoint: SerializedPoint;
	endPoint: SerializedPoint;
	graphPoints: SerializedPoint[];
}

export class LineGraphField extends NodeField {
	idPool = new IdPool();

	startPoint: GraphPoint = {
		id: this.idPool.GetNextId(),
		time: 0,
		value: 0,
	};

	endPoint: GraphPoint = {
		id: this.idPool.GetNextId(),
		time: 1,
		value: 1,
	};

	graphPoints: GraphPoint[] = [];

	GetPoints() {
		return this.graphPoints;
	}

	GetNumber(t: number) {
		if (this.graphPoints.size() === 0) {
			return LerpNumber(this.startPoint.value, this.endPoint.value, t);
		}

		let lastPoint = this.startPoint;
		for (const point of this.graphPoints) {
			if (t < point.time) {
				return LerpNumber(lastPoint.value, point.value, (t - lastPoint.time) / (point.time - lastPoint.time));
			}

			lastPoint = point;
		}

		return LerpNumber(
			lastPoint.value,
			this.endPoint.value,
			(t - lastPoint.time) / (this.endPoint.time - lastPoint.time),
		);
	}

	AddPoint(time: number, value: number) {
		const data = { id: this.idPool.GetNextId(), time, value };
		this.graphPoints.push(data);
		this.graphPoints.sort((a, b) => a.time < b.time);
		return data;
	}

	UpdatePoint(id: number, time: number, value: number) {
		const index = this.graphPoints.findIndex((point) => point.id === id);
		if (index !== -1) {
			this.graphPoints[index].time = time;
			this.graphPoints[index].value = value;
		}
		this.graphPoints.sort((a, b) => a.time < b.time);
	}

	RemovePoint(id: number) {
		delete this.graphPoints[this.graphPoints.findIndex((point) => point.id === id)];
	}

	SerializeData() {
		return {
			startPoint: {
				time: this.startPoint.time,
				value: this.startPoint.value,
			},
			endPoint: {
				time: this.endPoint.time,
				value: this.endPoint.value,
			},
			graphPoints: this.graphPoints.map((point) => ({
				time: point.time,
				value: point.value,
			})),
		};
	}

	ReadSerializedData(data: {}) {
		const serializedData = data as SerializedData;

		this.startPoint.time = serializedData.startPoint.time;
		this.startPoint.value = serializedData.startPoint.value;

		this.endPoint.time = serializedData.endPoint.time;
		this.endPoint.value = serializedData.endPoint.value;
		this.FieldChanged.Fire();

		serializedData.graphPoints.forEach((point) => {
			this.AddPoint(point.time, point.value);
		});
	}

	// GetLargestValue() {
	// 	let largest = this.startPoint.value;

	// 	for (const point of this.graphPoints) {
	// 		if (point.value > largest) {
	// 			largest = point.value;
	// 		}
	// 	}

	// 	if (this.endPoint.value > largest) {
	// 		largest = this.endPoint.value;
	// 	}

	// 	return largest;
	// }
}
