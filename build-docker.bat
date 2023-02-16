call npm run build
call docker build -t bouncerate-react-server .

call rd /s /q docker_image
call mkdir docker_image
call docker save -o docker_image/bouncerate-react-server-image.tar bouncerate-react-server
call docker image rm bouncerate-react-server