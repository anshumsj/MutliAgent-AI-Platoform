import api from "../api/axios.js"
export const logout = async () => {
    try {
        const { data } = await api.get("/api/auth/logout");
        return data;
    } catch (err) {
        console.log(err.response.data);
    }
}
