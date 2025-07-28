### ✅ Steps to create a dummy NIC with a custom IP:

#### 1. **Load the dummy driver**

```bash
sudo modprobe dummy
```

#### 2. **Create a dummy interface**

```bash
sudo ip link add dummy0 type dummy
sudo ip addr add 10.10.10.10/32 dev dummy0
sudo ip link set dummy0 up
```

✔ This creates a fake interface `dummy0` with IP `10.10.10.10`

---

### ✅ 3. **Test your app against it**

### ✅ To clean up:

```bash
sudo ip link delete dummy0
```

