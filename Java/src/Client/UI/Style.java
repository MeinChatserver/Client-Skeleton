package Client.UI;

import java.util.ArrayList;
import java.util.List;

public class Style {
	public interface StyleObserver {
		void update(Style style);
	}

	private String backgroundColor;
	private String textColor;
	private List<StyleObserver> observers;

	public Style() {
		this.observers = new ArrayList<>();
	}

	public void addObserver(StyleObserver observer) {
		observers.add(observer);
	}

	public void removeObserver(StyleObserver observer) {
		observers.remove(observer);
	}

	private void notifyObservers() {
		for(StyleObserver observer : observers) {
			observer.update(this);
		}
	}

	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
		notifyObservers();
	}

	public void setTextColor(String textColor) {
		this.textColor = textColor;
		notifyObservers();
	}

	public String getBackgroundColor() {
		return backgroundColor;
	}

	public String getTextColor() {
		return textColor;
	}
}
