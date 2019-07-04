const SAFE_CHARACTERS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const MULTIPLIER = 100000;
const DIVIDER = 32;

function encodePoints(points) {
	var result = "";
	var latitude = 0;
	var longitude = 0;

	for (var i in points) {
		var newLat = Math.round(points[i][0] * MULTIPLIER);
		var newLon = Math.round(points[i][1] * MULTIPLIER);

		var dy = newLat - latitude;
		var dx = newLon - longitude;

		latitude = newLat;
		longitude = newLon;
		dy = (dy << 1) ^ (dy >> 31);
		dx = (dx << 1) ^ (dx >> 31);

		var index = ((dy + dx) * (dy + dx + 1)) / 2 + dy;

		while (index > 0) {
			var rem = index & 31;

			index = (index - rem) / DIVIDER;

			if (index > 0) {
				rem += DIVIDER;
			}

			result += SAFE_CHARACTERS[rem];
		}
	}
	return result;
}

function decodePoints(compressedValue) {
	var latLon = [];
	var pointsArray = [];
	var point = [];
	var lastLat = 0,
		lastLon = 0;

	for (var i = 0; i < compressedValue.length; i++) {
		var num = SAFE_CHARACTERS.indexOf(compressedValue[i]);

		if (num < DIVIDER) {
			point.push(num);
			pointsArray.push(point);
			point = [];
		} else {
			num -= DIVIDER;
			point.push(num);
		}
	}

	for (var y in pointsArray) {
		var result = 0;
		var list = pointsArray[y].reverse();

		for (var x in list) {
			if (result == 0) {
				result = list[x];
			} else {
				result = result * DIVIDER + list[x];
			}
		}

		var dIag = parseInt((Math.sqrt(8 * result + 5) - 1) / 2);

		var latY = result - (dIag * (dIag + 1)) / 2;
		var lonX = dIag - latY;

		if (latY % 2 == 1) {
			latY = (latY + 1) * -1;
		}
		if (lonX % 2 == 1) {
			lonX = (lonX + 1) * -1;
		}

		latY /= 2;
		lonX /= 2;
		var lat = latY + lastLat;
		var lon = lonX + lastLon;

		lastLat = lat;
		lastLon = lon;
		lat /= MULTIPLIER;
		lon /= MULTIPLIER;

		latLon.push(lat, lon);
	}

	return latLon;
}
