import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#665b41",
    backgroundColor: "#665b41",
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  userEmail: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeMenuItem: {
    backgroundColor: "#fac039",
  },
  activeMenuItemText: {
    color: "white",
  },
  menuItemText: {
    marginLeft: 32,
    fontSize: 16,
    color: "#665b41",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fac039",
    padding: 18,
    borderRadius: 0,
    marginBottom: 0,
  },
  logoutText: {
    color: "white",
    marginLeft: 32,
    fontSize: 16,
    fontWeight: "bold",
  },
});
