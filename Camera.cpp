#include "Camera.hpp"

namespace gps {
    glm::vec3 aux,auxposition,auxtarget,auxup;

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraFrontDirection = glm::normalize(cameraPosition - cameraTarget); //cameraDirection
        this->cameraRightDirection = glm::normalize(glm::cross(cameraUp, cameraFrontDirection));
        this->cameraUpDirection = cameraUp;
        aux = cameraFrontDirection;
        auxposition = cameraPosition;
        auxtarget = cameraTarget;
        auxup = cameraUp;

        //TODO - Update the rest of camera parameters

    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        return glm::lookAt(cameraPosition + cameraFrontDirection, cameraPosition, glm::vec3(0.0f, 1.0f, 0.0f));
    }

 //   glm::vec3 getCameraPosition()  { return auxposition; }
 //  glm::vec3 getCameraTarget()  { return auxtarget; }
  //  glm::vec3 getCameraUp()  { return auxup; }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO
        switch (direction) {
        case MOVE_FORWARD:
            cameraPosition -= cameraFrontDirection * speed;
            break;

        case MOVE_BACKWARD:
            cameraPosition += cameraFrontDirection * speed;
            break;

        case MOVE_RIGHT:
            //cameraPosition = cameraFrontDirection;
         //   cameraFrontDirection = aux;
            cameraPosition += glm::normalize(glm::cross(cameraUpDirection, cameraFrontDirection)) * speed;
            cameraTarget = cameraPosition + cameraFrontDirection;
            //  cameraPosition += cameraFrontDirection * speed;
            break;

        case MOVE_LEFT:
            // cameraPosition = cameraFrontDirection;
           //  cameraFrontDirection = aux;
            cameraPosition -= glm::normalize(glm::cross(cameraUpDirection, cameraFrontDirection)) * speed;
            //  cameraPosition += cameraFrontDirection * speed;
            cameraTarget = cameraPosition + cameraFrontDirection;
            break;
        }
    }

    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis vertical
    //pitch - camera rotation around the x axis orizontal
    void Camera::rotate(float yaw, float pitch) {


        if (pitch > 89.0f)
            pitch = 89.0f;
        if (pitch < -89.0f)
            pitch = -89.0f;

        glm::vec3 direction;
        direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        direction.y = sin(glm::radians(pitch));
        direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        cameraFrontDirection = glm::normalize(direction);
    }

}