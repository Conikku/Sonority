import { IdPool } from "API/IdPool";
import { ColorField, SerializedColorField } from "./ColorField";
import { NodeField } from "./NodeField";

// BUG: last frame sometimes diff color (white?)

export interface ColorPoint {
	id: number;
	time: number;
	color: ColorField;
}

interface SerializedPoint {
	time: number;
	color: SerializedColorField;
}

interface SerializedData {
	startPoint: SerializedPoint;
	endPoint: SerializedPoint;
	colorPoints: SerializedPoint[];
}

export class ColorRampField extends NodeField {
	idPool = new IdPool();

	startPoint: ColorPoint = {
		id: this.idPool.GetNextId(),
		time: 0,
		color: new ColorField(0, 0, 1),
	};

	endPoint: ColorPoint = {
		id: this.idPool.GetNextId(),
		time: 1,
		color: new ColorField(0, 0, 0),
	};

	colorPoints: ColorPoint[] = [];

	GetPoints() {
		return this.colorPoints;
	}

	GetColor(t: number) {
		if (this.colorPoints.size() === 0) {
			return this.startPoint.color.GetColor().Lerp(this.endPoint.color.GetColor(), t);
		}

		let lastPoint = this.startPoint;
		for (const point of this.colorPoints) {
			if (t < point.time) {
				const alpha = (t - lastPoint.time) / (point.time - lastPoint.time);
				return lastPoint.color.GetColor().Lerp(point.color.GetColor(), alpha);
			}

			lastPoint = point;
		}

		const alpha = (t - lastPoint.time) / (this.endPoint.time - lastPoint.time);
		return lastPoint.color.GetColor().Lerp(this.endPoint.color.GetColor(), alpha);
	}

	AddPoint(time: number, color: Vector3) {
		const data = { id: this.idPool.GetNextId(), time, color: new ColorField(color.X, color.Y, color.Z) };
		this.colorPoints.push(data);
		this.colorPoints.sort((a, b) => a.time < b.time);
		return data;
	}

	UpdatePointTime(id: number, time: number) {
		const index = this.colorPoints.findIndex((point) => point.id === id);
		if (index !== -1) {
			this.colorPoints[index].time = time;
		}
		this.colorPoints.sort((a, b) => a.time < b.time);
	}

	RemovePoint(id: number) {
		delete this.colorPoints[this.colorPoints.findIndex((point) => point.id === id)];
	}

	SerializeData() {
		return {
			startPoint: {
				time: this.startPoint.time,
				color: this.startPoint.color.SerializeData(),
			},
			endPoint: {
				time: this.endPoint.time,
				color: this.endPoint.color.SerializeData(),
			},
			colorPoints: this.colorPoints.map((point) => ({
				time: point.time,
				color: point.color.SerializeData(),
			})),
		};
	}

	ReadSerializedData(data: {}) {
		const serializedData = data as SerializedData;

		this.startPoint.time = serializedData.startPoint.time;
		this.startPoint.color.ReadSerializedData(serializedData.startPoint.color);

		this.endPoint.time = serializedData.endPoint.time;
		this.endPoint.color.ReadSerializedData(serializedData.endPoint.color);
		this.FieldChanged.Fire();

		serializedData.colorPoints.forEach((point) => {
			this.AddPoint(point.time, new Vector3(point.color.hue, point.color.saturation, point.color.value));
		});
	}
}
