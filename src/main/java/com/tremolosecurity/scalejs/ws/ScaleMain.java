/*******************************************************************************
 * Copyright 2016 Tremolo Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
package com.tremolosecurity.scalejs.ws;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.tremolosecurity.proxy.filter.HttpFilter;
import com.tremolosecurity.proxy.filter.HttpFilterChain;
import com.tremolosecurity.proxy.filter.HttpFilterConfig;
import com.tremolosecurity.proxy.filter.HttpFilterRequest;
import com.tremolosecurity.proxy.filter.HttpFilterResponse;
import com.tremolosecurity.saml.Attribute;
import com.tremolosecurity.scalejs.cfg.ScaleAttribute;
import com.tremolosecurity.scalejs.cfg.ScaleConfig;

public class ScaleMain implements HttpFilter {

	static Logger logger = Logger.getLogger(ScaleMain.class.getName());
	
	ScaleConfig scaleConfig;
	
	
	@Override
	public void doFilter(HttpFilterRequest request, HttpFilterResponse response, HttpFilterChain chain)
			throws Exception {
		Gson gson = new Gson();
		
		if (request.getRequestURI().endsWith("/main/config")) {
			response.setContentType("application/json");
			response.getWriter().println(gson.toJson(scaleConfig).trim());
		} else {
			throw new Exception("Operation not supported");
		}

	}

	@Override
	public void filterResponseText(HttpFilterRequest request, HttpFilterResponse response, HttpFilterChain chain,
			StringBuffer data) throws Exception {
		

	}

	@Override
	public void filterResponseBinary(HttpFilterRequest request, HttpFilterResponse response, HttpFilterChain chain,
			byte[] data, int length) throws Exception {
		

	}

	
	private String loadAttributeValue(String name,String label,HttpFilterConfig config) throws Exception {
		Attribute attr = config.getAttribute(name);
		if (attr == null) {
			throw new Exception(label + " not found");
		}
		
		String val = attr.getValues().get(0);
		logger.info(label + ": '" + val + "'");
		
		return val;
	}
	
	@Override
	public void initFilter(HttpFilterConfig config) throws Exception {
		this.scaleConfig = new ScaleConfig();
		scaleConfig.setDisplayNameAttribute(this.loadAttributeValue("displayNameAttribute", "Display Name Attribute Name", config));
		scaleConfig.getFrontPage().setTitle(this.loadAttributeValue("frontPage.title", "Front Page Title", config));
		scaleConfig.getFrontPage().setText(this.loadAttributeValue("frontPage.text", "Front Page Text", config));
		scaleConfig.setCanEditUser(this.loadAttributeValue("canEditUser", "User Fields Editable", config).equalsIgnoreCase("true"));
		scaleConfig.setWorkflowName(this.loadAttributeValue("workflowName", "Save User Workflow", config));
		
		Attribute attr = config.getAttribute("attributeNames");
		if (attr == null) {
			throw new Exception("Attribute names not found");
		}
		
		for (String attributeName : attr.getValues()) {
			ScaleAttribute scaleAttr = new ScaleAttribute();
			scaleAttr.setName(attributeName);
			scaleAttr.setDisplayName(this.loadAttributeValue(attributeName + ".displayName", attributeName + " Display Name", config));
			scaleAttr.setReadOnly(this.loadAttributeValue(attributeName + ".readOnly", attributeName + " Read Only", config).equalsIgnoreCase("true"));
			scaleConfig.getAttributes().put(attributeName, scaleAttr);
		}
		
	}

}
