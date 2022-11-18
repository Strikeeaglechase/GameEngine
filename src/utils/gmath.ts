class GMath {
	public static rad(deg: number): number { return deg * Math.PI / 180; };
	public static deg(rad: number): number { return rad * 180 / Math.PI; };
}

export { GMath };