import { useState } from "react";

const CreateEvent = () => {
  const [formData, setFormData] = useState({ name: "", date: "", location: "", image: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("date", formData.date);
    data.append("location", formData.location);
    data.append("image", formData.image);

    await fetch("/api/events/create", { method: "POST", body: data });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Event Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <input type="date" onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
      <input type="text" placeholder="Location" onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
      <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
