import { authRequest } from "@/lib/auth/apiClient";

const request = async ({ ...options }, router) => {
  try {
    const response = await authRequest(options);
    return response;
  } catch (error) {
    if (error?.response?.status == 403) {
      router && router.push("/en/403");
    }
    return error;
  }
};

export default request;
