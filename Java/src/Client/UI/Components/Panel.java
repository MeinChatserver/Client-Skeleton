/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.0
 * @author Adrian Preuß
 */

package Client.UI.Components;

import java.awt.Color;
import java.awt.Component;
import java.awt.Container;
import java.awt.Graphics;
import java.awt.LayoutManager2;
import java.awt.image.BufferedImage;

import javax.swing.JPanel;

import Protocol.BackgroundImage;
import Protocol.BackgroundPosition;

public class Panel extends JPanel {
	protected BackgroundImage background_image = null;
	private Color background_color = new Color(255, 255, 255, 0);
    private Color foreground_color = new Color(0, 0, 0, 0);

	public Panel() {
		super();
		this.init();
	}

	public Panel(LayoutManager2 layout) {
		super(layout);
		this.init();
	}

	protected void init() {
		this.setBackground(this.background_color);
		this.setForeground(this.foreground_color);
		this.setOpaque(false);
		this.update();
	}

	public void update() {
		this.revalidate();
		this.repaint();
	}

	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);

		/* Background Color */
		if(this.background_color != null) {
			g.setColor(this.background_color);
			g.fillRect(0, 0, this.getWidth(), this.getHeight());
		}

		/* Background Image */
		if(this.background_image != null) {
			BufferedImage image = this.background_image.getImage();

			if(image != null) {
				int width = image.getWidth();
				int height = image.getHeight();
				int x = 0;
				int y = 0;

				if(this.background_image.getPosition() != null) {
					switch(this.background_image.getPosition()) {
						case BackgroundPosition.STRETCHED:
							width = this.getWidth();
							height = this.getHeight();
						break;
						case BackgroundPosition.SCALED_FILL_CENTER_1:
							float scale1 = Math.max((float) this.getWidth() / width, (float) this.getHeight() / height);
							width *= scale1;
							height *= scale1;
							x = (this.getWidth() - width) / 2;
							y = (this.getHeight() - height) / 2;
						break;
						case BackgroundPosition.SCALED_FILL_CENTER_2:
							float scale2 = Math.min((float) this.getWidth() / width, (float) this.getHeight() / height);
							width *= scale2;
							height *= scale2;
							x = (this.getWidth() - width) / 2;
							y = (this.getHeight() - height) / 2;
						break;
						case BackgroundPosition.SCALED_FILL_CENTER_3:
							x = (this.getWidth() - width) / 2;
							y = (this.getHeight() - height) / 2;
						break;
						case BackgroundPosition.SCALED_HEIGHT_RIGHT:
							float scaleH = (float) this.getHeight() / height;
							width *= scaleH;
							height = this.getHeight();
							x = this.getWidth() - width;
							y = 0;
						break;
						case BackgroundPosition.SCALED_WIDTH_TOP:
							float scaleW1 = (float) this.getWidth() / width;
							width = this.getWidth();
							height *= scaleW1;
							x = 0;
							y = 0;
						break;
						case BackgroundPosition.SCALED_WIDTH_BOTTOM:
							float scaleW2 = (float) this.getWidth() / width;
							width = this.getWidth();
							height *= scaleW2;
							x = 0;
							y = this.getHeight() - height;
						break;
						case BackgroundPosition.TILED:
						case BackgroundPosition.TILED_ZOOM_2:
						case BackgroundPosition.TILED_ZOOM_3:
						case BackgroundPosition.TILED_ROWS_OFFSET:
						case BackgroundPosition.TILED_ROWS_ZOOM_2:
						case BackgroundPosition.TILED_ROWS_ZOOM_3:
						case BackgroundPosition.TILED_COLUMS:
						case BackgroundPosition.TILED_COLUMS_ZOOM_2:
						case BackgroundPosition.TILED_COLUMS_ZOOM_3:
                            BackgroundPosition pos = this.background_image.getPosition();
                            boolean isRowOffset = (pos == BackgroundPosition.TILED_ROWS_OFFSET ||
                                    pos == BackgroundPosition.TILED_ROWS_ZOOM_2 ||
                                    pos == BackgroundPosition.TILED_ROWS_ZOOM_3);
                            float tileScale = 1f;

							if(this.background_image.getPosition() == BackgroundPosition.TILED_ZOOM_2 || this.background_image.getPosition() == BackgroundPosition.TILED_ROWS_ZOOM_2 || this.background_image.getPosition() == BackgroundPosition.TILED_COLUMS_ZOOM_2)
								tileScale = 2f;
							else if(this.background_image.getPosition() == BackgroundPosition.TILED_ZOOM_3 || this.background_image.getPosition() == BackgroundPosition.TILED_ROWS_ZOOM_3 || this.background_image.getPosition() == BackgroundPosition.TILED_COLUMS_ZOOM_3)
								tileScale = 3f;

							int tileW = (int) (width * tileScale);
							int tileH = (int) (height * tileScale);

                            for(int i = 0; i < this.getWidth(); i += tileW) {
                                for(int j = 0; j < this.getHeight(); j += tileH) {
									// Versatz für Zeilen?
                                    int offsetX = isRowOffset && (j / tileH) % 2 == 1 ? tileW / 2 : 0;
									int offsetY = 0;

									if(this.background_image.getPosition() == BackgroundPosition.TILED_COLUMS || this.background_image.getPosition() == BackgroundPosition.TILED_COLUMS_ZOOM_2 || this.background_image.getPosition() == BackgroundPosition.TILED_COLUMS_ZOOM_3) {
										// Nur vertikal wiederholen
										for(int yCol = 0; yCol < this.getHeight(); yCol += tileH)
											g.drawImage(image, x, yCol, x + tileW, yCol + tileH, 0, 0, width, height, this);
										break;
									} else {
										g.drawImage(image, i + offsetX, j + offsetY, i + offsetX + tileW, j + offsetY + tileH, 0, 0, width, height, this);
									}
								}
							}
							return; // Bereits gezeichnet
						case BackgroundPosition.CENTERED:
							x = (this.getWidth() - width) / 2;
							y = (this.getHeight() - height) / 2;
						break;
						case BackgroundPosition.CENTERED_2:
						case BackgroundPosition.CENTERED_3:
							float scaleC = this.background_image.getPosition() == BackgroundPosition.CENTERED_2 ? 2f : 3f;
							width *= scaleC;
							height *= scaleC;
							x = (this.getWidth() - width) / 2;
							y = (this.getHeight() - height) / 2;
						break;
					}
				}

				g.drawImage(image, x, y, width, height, this);
			}
		}
	}

    @Override
    public void setBackground(Color color) {
        if(this.background_color != null && this.background_color.equals(color)) {
            return;
        }

        this.background_color = color;
        this.update();
    }

	public void setBackground(Color color, BackgroundImage image) {
		this.background_color = color;
		this.background_image = image;

		this.update();
	}

	@Override
	public Color getForeground() {
        return this.foreground_color;
    }

    @Override
	public void setForeground(Color color) {
        if(this.foreground_color != null && this.foreground_color.equals(color)) {
            return;
        }

        this.foreground_color = color;

        this.setForegrounds(this);
	}

	public void setForegrounds(Component component) {
        if(component instanceof Container) {
            Component[] children = ((Container) component).getComponents();

            for(Component child : children) {
                if(child instanceof Label) {
                    child.setForeground(this.foreground_color);
                }

                if(child instanceof Container) {
                    setForegrounds(child);
                }
            }
        }
	}
}
