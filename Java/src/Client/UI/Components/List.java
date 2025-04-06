package Client.UI.Components;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.AdjustmentEvent;
import java.awt.event.AdjustmentListener;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.util.Vector;

import javax.swing.JPanel;
import javax.swing.JScrollBar;

public class List extends JPanel implements ComponentListener, AdjustmentListener, KeyListener, MouseListener, MouseMotionListener {
	private JScrollBar scrollbar = new JScrollBar(JScrollBar.VERTICAL, 1, 1, 0, 2);
	static Vector<String> entries = new Vector<String>();
	private Graphics2D g2d;
	
	public List() {
		super(new BorderLayout());
		
		this.setBackground(null);
		this.addMouseListener((MouseListener) this);
		this.addMouseMotionListener((MouseMotionListener) this);
        this.addComponentListener((ComponentListener) this);
        this.scrollbar.addAdjustmentListener((AdjustmentListener) this);
	}
	
	public void addEntry(String name) {
		this.entries.add(name);		
	}

	public void clearEntrys() {
		this.entries.clear();
	}
	
	@Override
	public void mouseDragged(MouseEvent e) {}

	@Override
	public void mouseMoved(MouseEvent e) {}

	@Override
	public void mouseClicked(MouseEvent e) {}

	@Override
	public void mousePressed(MouseEvent e) {}

	@Override
	public void mouseReleased(MouseEvent e) {}

	@Override
	public void mouseEntered(MouseEvent e) {}

	@Override
	public void mouseExited(MouseEvent e) {}

	@Override
	public void keyTyped(KeyEvent e) {}

	@Override
	public void keyPressed(KeyEvent e) {}

	@Override
	public void keyReleased(KeyEvent e) {}

	@Override
	public void adjustmentValueChanged(AdjustmentEvent e) {}

	@Override
	public void componentResized(ComponentEvent e) {}

	@Override
	public void componentMoved(ComponentEvent e) {}

	@Override
	public void componentShown(ComponentEvent e) {}

	@Override
	public void componentHidden(ComponentEvent e) {}
	
	@Override
	public void paint(Graphics paramGraphics) {
		this.g2d = ((Graphics2D)paramGraphics);
		//this.g2d.setColor(Color.decode("0xFF0000"));
		this.g2d.clearRect(0, 0, getSize().width, getSize().height);
		
		int i = 17;
		int j = 0;
		
		for(int k = entries.size(); j < k; ++j) {
			String text = entries.elementAt(j).toString();

			this.g2d.setColor(Color.decode("0x000000"));
			this.g2d.drawString(text, 20, i - 2);
			
			 i += 19;
		}
	}
}
