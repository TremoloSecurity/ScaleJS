package com.tremolosecurity.scalejs.token.sdk;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpSession;

import com.tremolosecurity.proxy.auth.AuthInfo;
import com.tremolosecurity.proxy.filter.HttpFilterConfig;
import com.tremolosecurity.saml.Attribute;

public class AttributeToken implements TokenLoader {

	ArrayList<String> attributes;
	
	@Override
	public void init(HttpFilterConfig config) throws Exception {
		this.attributes = new ArrayList<String>();
		this.attributes.addAll(config.getAttribute("attributes").getValues());

	}

	@Override
	public Object loadToken(AuthInfo user, HttpSession session) throws Exception {
		HashMap<String,String> attrs = new HashMap<String,String>();
		
		for (String attrName : this.attributes) {
			Attribute attr = user.getAttribs().get(attrName);
			if (attr != null) {
				attrs.put(attr.getName(),attr.getValues().get(0));
			}
		}
		
		return attrs;
	}

}
