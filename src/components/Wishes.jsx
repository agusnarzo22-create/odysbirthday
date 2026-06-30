import React, { useState } from 'react';
import { Heart, Smile, Flame, ThumbsUp, Send } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

const Wishes = () => {
  // Pre-configured list of 5 wishes with beautiful placeholders and mock avatars
  const initialWishes = [
    {
      id: 1,
      sender: "Wangih (Aseli Jogja)",
      avatarUrl: "/images/wangi.jpeg",
      message: "haappy ody's dayyy!🤍 selalu diberi kesehatan, selalu ceria, bahagia, hari-hari kamu dipenuhi dengan banyak hal baik, semua yang sedang kamu usahakan diberikan kemudahan dan hasil yang terbaik, juga doa nya terwujud dengan baiik😍💗. semangat terusss menjalani hari-hari ke depannya yaa. have a wonderful birthday odyyy lovee! 🌷🫶🏻",
      time: "12:22 PM",
      reactions: { heart: 10, laugh: 2, fire: 0 }
    },
    {
      id: 2,
      sender: "Kaisar Agus (Baginda)",
      avatarUrl: "/images/agus.jpeg",
      message: "Selamat habede, mat ulang taun, sehat selalu, panjang umurh, dilancarkan rejekinya, tercapai cita-citanya, dilancarkan hubungannya, dan ditunggu te er nya awoakowko. Salam Ambatubuzz Lightyear!!",
      time: "21:06 AM",
      reactions: { heart: 2, laugh: 5, fire: 1 }
    },
    {
      id: 3,
      sender: "Kingdams (Humbles Buanget)",
      avatarUrl: "/images/adam.jpeg",
      message: "Happy birthday, Odyy🥳🎉 Semoga panjang umur, sehat selalu, banyak rezeki, dilancarkan urusannya dan semakin sukses ke depannyaa. Semoga semua harapan dan rencananya dimudahkan selalu oleh Allah SWT. Dan, Semoga tahun ini jauh lebih baik dari tahun sebelumnya. Aamiin ya rabbal alamiin😇🤲 -TemangMu-",
      time: "18:00 PM",
      reactions: { heart: 8, laugh: 4, fire: 6 }
    },
    {
      id: 4,
      sender: "Ngab Hilal (Loyality)",
      avatarUrl: "/images/hilal.jpeg",
      message: "Selamat ulang tahun ody ratu crypto, Semoga makin keren, makin sukses, makin banyak rezeki, dan jangan lupa traktirannya minimal saham 10 lembar!",
      time: "12:28 PM",
      reactions: { heart: 3, laugh: 7, fire: 2 }
    },
    {
      id: 5,
      sender: "Ftahur (Nigga)",
      avatarUrl: "/images/fathur.jpeg",
      message: "Happy birthday Aqila, wish u all the best ya, pokoknya doa dari ku bahagia bahagia dan bahagia, satu kali ji hidup jadi harus bahagia, pokoknya selalu lakukan apa yang buat ko senan, buatko bahagia, u know ur self better than me lah yaa, pokok nya harus happy, terus tetaplah menjadi kopi yang di senangi banyak orang.",
      time: "16:58 PM",
      reactions: { heart: 4, laugh: 1, fire: 3 }
    }
  ];

  const [wishes, setWishes] = useState(initialWishes);

  const handleReact = (wishId, type) => {
    setWishes(prevWishes =>
      prevWishes.map(wish => {
        if (wish.id === wishId) {
          return {
            ...wish,
            reactions: {
              ...wish.reactions,
              [type]: wish.reactions[type] + 1
            }
          };
        }
        return wish;
      })
    );
  };

  return (
    <section id="wishes" className="section-wishes">
      <div className="section-container">
        <h2 className="section-title">Wishes for You ✨</h2>
        <p className="section-subtitle">Ucapan dan doa tulus dari kami untukmu</p>

        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-status">
              <span className="online-dot" />
              <span>Grup Ulang Tahun Ody (5 Online)</span>
            </div>
          </div>

          <div className="chat-body">
            {wishes.map((wish) => (
              <div key={wish.id} className="chat-message-row">
                {/* Left: Friend Avatar */}
                <div className="chat-avatar-container">
                  <img
                    src={getAssetUrl(wish.avatarUrl)}
                    alt={wish.sender}
                    className="chat-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(wish.sender)}&background=ffb7c5&color=fff`;
                    }}
                  />
                </div>

                {/* Right: Message Bubble */}
                <div className="chat-bubble-container">
                  <div className="chat-bubble-info">
                    <span className="chat-sender">{wish.sender}</span>
                    <span className="chat-time">{wish.time}</span>
                  </div>

                  <div className="chat-bubble">
                    <p className="chat-message-text">{wish.message}</p>

                    {/* Reaction Buttons inside bubble */}
                    <div className="reaction-bar">
                      <button
                        onClick={() => handleReact(wish.id, 'heart')}
                        className="reaction-btn heart"
                        title="Love"
                      >
                        <Heart size={14} fill="#ff4d6d" stroke="#ff4d6d" />
                        <span className="reaction-count">{wish.reactions.heart}</span>
                      </button>
                      <button
                        onClick={() => handleReact(wish.id, 'laugh')}
                        className="reaction-btn laugh"
                        title="Haha"
                      >
                        <Smile size={14} fill="#ffb703" stroke="#ffb703" />
                        <span className="reaction-count">{wish.reactions.laugh}</span>
                      </button>
                      <button
                        onClick={() => handleReact(wish.id, 'fire')}
                        className="reaction-btn fire"
                        title="Awesome"
                      >
                        <Flame size={14} fill="#fb8500" stroke="#fb8500" />
                        <span className="reaction-count">{wish.reactions.fire}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Wishes;
