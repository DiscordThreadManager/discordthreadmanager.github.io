//Stufd you need to config:
const token = "" // Your bot token
const channelID = "882394750655795210"; // The channel you want requests to go to

const Discord = require('discord.js');
const FLAGS = Discord.Intents.FLAGS;
const db = require('quick.db');
const Client = new Discord.Client({  
intents: [FLAGS.DIRECT_MESSAGES, FLAGS.DIRECT_MESSAGE_REACTIONS, FLAGS.GUILDS, FLAGS.GUILD_BANS, FLAGS.GUILD_EMOJIS_AND_STICKERS, FLAGS.GUILD_INTEGRATIONS, FLAGS.GUILD_INVITES, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_MESSAGES, FLAGS.GUILD_MESSAGE_REACTIONS, FLAGS.GUILD_MESSAGE_REACTIONS, FLAGS.GUILD_PRESENCES, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_WEBHOOKS]
})

const actionRow = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('delThread')
            .setLabel('Delete')
            .setStyle('DANGER')
)

const blankActionRow = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
            .setCustomId('delThread')
            .setLabel('Deleted')
            .setStyle('DANGER')
            .setDisabled(true)
)


Client.on('threadCreate', async (thread) => {
    var err = false
    const {name, manageable, parent, ownerId, guild} = thread
    const user = await thread.guild.members.fetch(ownerId).catch((e)=> {console.log(e);err=true});

    if(err) {
        const channel = await guild.channels.fetch(channelID);
        const l = await channel.send({content: `<:Create:873747469295554631> **Thread Created** - **UNKNOWN** created the thread **${name}** on ${parent.name} (<#${parent.id}>), I ${canedit(manageable)} edit this thread`, components: [actionRow]}).catch((e)=>{console.log(e)});
        db.set(`ThreadFor-${l.id}`, thread.id);
        db.set(`ChannelFor-${l.id}`, parent.id);
        db.set(`MessageFor-${thread.id}`, l.id);
        db.set(`MessageFor-${thread.id}`, `<:Create:873747469295554631> **Thread Created** -  **UNKNOWN** created the thread **${name}** on ${parent.name} (<#${parent.id}>), I ${canedit(manageable)} edit this thread`)
    } else {
        const channel = await guild.channels.fetch(channelID);
        const l = await channel.send({content: `<:Create:873747469295554631> **Thread Created** - ${user.user.tag} (${ownerId}) created the thread **${name}** on ${parent.name} (<#${parent.id}>), I ${canedit(manageable)} edit this thread`, components: [actionRow]}).catch((e)=>{console.log(e)});
        db.set(`ThreadFor-${l.id}`, thread.id);
        db.set(`ChannelFor-${l.id}`, thread.parentId);
        db.set(`MessageIdFor-${thread.id}`, l.id);
        db.set(`MessageFor-${thread.id}`, `<:Create:873747469295554631> **Thread Created** - ${user.user.tag} (${ownerId}) created the thread **${name}** on ${parent.name} (<#${parent.id}>), I ${canedit(manageable)} edit this thread`)
    }
})

Client.on('interactionCreate', async (interaction) => {
    if(interaction.isButton()) {
        if(interaction.customId == "delThread") {
            if(!interaction.member.permissions.has('MANAGE_THREADS')) {
                await interaction.reply({content: 'You dont have permission to manage threads', ephemeral: true}).catch((e)=>{console.log(e)});
                return;
            }
            const threadInMessage = db.get(`ThreadFor-${interaction.message.id}`);
            const cnlm = db.get(`ChannelFor-${interaction.message.id}`);
            const threadsChannel = await interaction.guild.channels.fetch(cnlm)
            const thread = await threadsChannel.threads.fetch(threadInMessage)
            const messagec = db.get(`MessageFor-${thread.id}`);

            thread.delete('Thread deleted by moderator');
            await interaction.reply({content: 'The thread has been deleted', ephemeral: true}).catch((e)=>{console.log(e)});
            interaction.message.edit({content: messagec, components: [blankActionRow]})
            db.delete(`MessageFor-${thread.id}`);
            db.delete(`ChannelFor-${interaction.message.id}`);
            db.delete(`ThreadFor-${interaction.message.id}`);
            db.delete(`MessageIdFor-${thread.id}`);
        }
    }
})

Client.on('threadDelete', async (thread) => {
    var err = false
    const {name, manageable, parent, ownerId, guild} = thread
    const user = await thread.guild.members.fetch(ownerId).catch((e)=> {console.log(e);err=true});
    const msg = db.get(`MessageIdFor-${thread.id}`);
    const messagec = db.get(`MessageFor-${thread.id}`);

    if(err) {
        const channel = await guild.channels.fetch(channelID).catch((e)=>{console.log(e)});
        channel.send({content: `<:Delete:873747469077450822> **Thread Deleted** - **UNKNOWN**s thread was deleted (${name})`}).catch((e)=>{console.log(e);});
        const message = await channel.messages.fetch(msg).catch((e)=>{console.log(e)});
        message.edit(({content: messagec, components: [blankActionRow]})).catch((e)=>{console.log(e)});
    } else {
        const channel = await guild.channels.fetch(channelID).catch((e)=>{console.log(e)});
        channel.send({content: `<:Delete:873747469077450822> **Thread Deleted** - ${user.user.tag}'s' thread was deleted (${name})`}).catch((e)=>{console.log(e);});
        const message = await channel.messages.fetch(msg).catch((e)=>{console.log(e)});
        message.edit(({content: messagec, components: [blankActionRow]})).catch((e)=>{console.log(e)});
    }
    db.delete(`ChannelFor-${msg}`);
    db.delete(`ThreadFor-${msg}`);
    db.delete(`MessageIdFor-${thread.id}`);
    db.delete(`MessageFor-${thread.id}`);
    
})

Client.on('threadUpdate', async (oldThread, newThread) => {
    const {guild, ownerId} = oldThread
    const user = await guild.members.fetch(ownerId).catch((e)=> {console.log(e);err=true});
    if(oldThread.name == newThread.name) {
        if(oldThread.archived == newThread.archived) return;
    }
     if(oldThread.name !== newThread.name) {
        const channel = await guild.channels.fetch(channelID).catch((e)=>{console.log(e)});
        channel.send({content: `<:Operation:873747468750307409> **Thread Renamed** - ${user.user.tag}'s' thread was renamed from ${oldThread.name} to ${newThread.name}`}).catch((e)=>{console.log(e);});
    }
    if(oldThread.archived !== newThread.archived) {
        if(!oldThread.archived && newThread.archived) {
            const channel = await guild.channels.fetch(channelID).catch((e)=>{console.log(e)});
            channel.send({content: `<:Operation:873747468750307409> **Thread Archived** - ${user.user.tag}'s' thread was archived (${oldThread.name})`}).catch((e)=>{console.log(e);});
        } else {
            const channel = await guild.channels.fetch(channelID).catch((e)=>{console.log(e)});
            channel.send({content: `<:Operation:873747468750307409> **Thread UnArchived** - ${user.user.tag}'s' thread was unarchived (${oldThread.name})`}).catch((e)=>{console.log(e);});
        }
    }
})

Client.login(token)

function canedit(m) {
    if(!m) {
        return 'can not'
    } if(m) {
        return 'can'
    }

    return 'have no idea if I can'
}
