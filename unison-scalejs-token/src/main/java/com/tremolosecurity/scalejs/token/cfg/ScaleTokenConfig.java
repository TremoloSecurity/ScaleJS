package com.tremolosecurity.scalejs.token.cfg;

import com.tremolosecurity.scalejs.cfg.ScaleFrontPage;

public class ScaleTokenConfig {
	
	
	transient String  displayNameAttribute;
	
	ScaleFrontPage frontPage;
	String logoutURL;
	String homeURL;
	
	public ScaleTokenConfig() {
		this.frontPage = new ScaleFrontPage();
	}
	
	
	
	public String getDisplayNameAttribute() {
		return displayNameAttribute;
	}
	public void setDisplayNameAttribute(String displayNameAttribute) {
		this.displayNameAttribute = displayNameAttribute;
	}
	
	
	public ScaleFrontPage getFrontPage() {
		return frontPage;
	}
	public void setFrontPage(ScaleFrontPage frontPage) {
		this.frontPage = frontPage;
	}
	public String getLogoutURL() {
		return logoutURL;
	}
	public void setLogoutURL(String logoutURL) {
		this.logoutURL = logoutURL;
	}



	public String getHomeURL() {
		return homeURL;
	}



	public void setHomeURL(String homeURL) {
		this.homeURL = homeURL;
	}
	
	
	
}
