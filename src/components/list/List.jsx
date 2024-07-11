import ChatList from "./chatList/ChatList"; // Adjust based on actual file name
import "./list.css";
import Userinfo from "./userInfo/Userinfo";

const List = () => {
    return (
        <div className='list'>
            <Userinfo />
            <ChatList />
        </div>
    );
}

export default List;
