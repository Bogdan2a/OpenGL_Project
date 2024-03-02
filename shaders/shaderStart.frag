#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;
uniform vec3 pointLightPos;
uniform vec3 pointLightColor;

uniform bool pointLightOn;
uniform bool fogEnabled;

uniform mat4 view;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;
vec3 colorOfLight;
vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;

float computeShadow()
{
	
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

	normalizedCoords = normalizedCoords * 0.5 + 0.5;

	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;

	float currentDepth = normalizedCoords.z;

	float bias2 = max(0.05f * (1.0f - dot(normalize(fNormal), lightDir)), 0.005f);
	float shadow2 = currentDepth - bias2 > closestDepth ? 1.0f : 0.0f;

	return shadow2;

}
void computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin

	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN;
	if(!pointLightOn)
		 lightDirN = normalize(lightDir);
	else
		 lightDirN = normalize((view * vec4(pointLightPos, 1.0f)).xyz - fPosEye.xyz);

	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
    float constant = 1.0f;
	float linear = 0.0045f;
	float quadratic = 0.0075f;

	//compute distance to light
	float dist = length(pointLightPos - fPosEye.xyz);
	//compute attenuation
	float att;
	if(!pointLightOn)
		 att = 1.0f;
	else
		 att = 1.0f / (constant + linear * dist + quadratic * (dist * dist)) ;


	//compute ambient light
	ambient +=  att * ambientStrength * colorOfLight;
	
	//compute diffuse light
	diffuse += att * max(dot(normalEye, lightDirN), 0.0f) * colorOfLight;
	

	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular += att * specularStrength * specCoeff * colorOfLight;
}

float computeFog()
{
 float fogDensity = 0.05f;
 float fragmentDistance = length(fPosEye);
 float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));

 return clamp(fogFactor, 0.0f, 1.0f);
}

void main() 
{
	
	if(!pointLightOn)
		 colorOfLight = lightColor;
	else
		 colorOfLight = pointLightColor;

	computeLightComponents();
	float shadow = computeShadow();
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;

	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
	vec3 colorFinal = min((ambient + diffuse) + specular, color);
    
	if (fogEnabled) 
	{
		float fogFactor = computeFog();
		vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);

		vec4 colorFromTexture = texture(diffuseTexture, fTexCoords);
		if (colorFromTexture.a < 0.1) {
			discard; // Discard fragment if alpha < 0.1
		}

		fColor = vec4(mix(fogColor.rgb, colorFinal.rgb, fogFactor), 1.0);
	} 

	else 

	{
	    vec4 colorFromTexture = texture(diffuseTexture, fTexCoords);
		if (colorFromTexture.a < 0.1) {
			discard; // Discard fragment if alpha < 0.1
		}
		fColor = vec4(colorFinal, 1.0);
	}

}