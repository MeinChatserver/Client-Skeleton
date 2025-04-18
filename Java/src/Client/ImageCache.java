package Client;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.ImageIO;

public class ImageCache {
	private static final ImageCache INSTANCE = new ImageCache();
	private final ConcurrentHashMap<String, BufferedImage> cache = new ConcurrentHashMap<>();
	private final HttpClient http = HttpClient.newHttpClient();

	public static ImageCache getInstance() {
		return INSTANCE;
	}

	public BufferedImage getImage(String pathOrUrl) {
		if(cache.containsKey(pathOrUrl)) {
			System.out.println("[ImageCache] Image exists: " + pathOrUrl);
			return cache.get(pathOrUrl);
		}

		try {
			BufferedImage image;

			if(pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
				HttpRequest request = HttpRequest.newBuilder().uri(URI.create(pathOrUrl)).build();
				HttpResponse<InputStream> response = http.send(request, HttpResponse.BodyHandlers.ofInputStream());
				System.out.println("[ImageCache] Load Image from URL: " + pathOrUrl);
				image = ImageIO.read(response.body());
			} else {
				System.out.println("[ImageCache] Load local Image: " + pathOrUrl);
				image = ImageIO.read(new File(pathOrUrl));
			}

			if(image != null) {
				System.out.println("[ImageCache] Store Image: " + pathOrUrl);
				cache.put(pathOrUrl, image);
			}

			return image;
		} catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public ConcurrentHashMap<String, BufferedImage> getCache() {
		return cache;
	}
}
