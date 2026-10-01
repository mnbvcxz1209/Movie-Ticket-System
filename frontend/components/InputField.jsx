export default function InputField({ label, name, type = "text", value, onChange }) {
    return (
        <div>
            <label>{label}</label>
            <br />
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
            />
            <br /><br />
        </div>
    );
}
