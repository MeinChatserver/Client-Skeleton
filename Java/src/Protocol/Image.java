package Protocol;

public class Image implements IPacket {
	private String url = null;
	
    public Image(String url) {
		this.url = url;
	}

	@Override
    public String toString() {
        return "[Image " + this.url + "]";
    }

	@Override
	public String getOperation() {
		return "IMAGE";
	}

	public Object getImage() {
		// TODO Auto-generated method stub
		return null;
	}
}