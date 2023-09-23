const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
} = require("discord.js");

const {
  ALLOWED_DECODERS,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_IN_MB,
  MAX_ENABLED_PER_USER,
} = require("../../constants");
const { is16by9AR } = require("../../utilities/imageSizeChecker");
const {
  UserFixableAction,
  WrongFileType,
  ImageWrongAspectRatio,
  ImageFilesizeTooLarge,
} = require("../../utilities/errors");
const { findAllPicsByUser, setEnabledStatusForPic } = require("../../db");
const { pipeline } = require("../../utilities/imagePipeline");
const config = require("../../config");
const path = require("path");

const attachmentBuilder = (picRow) => {
  const imagepath = (filename = path.join(config.imagePath, picRow.filename));

  const attachment = new AttachmentBuilder(imagepath, {
    name: `image-${picRow.id}.png`,
  });
  return attachment;
};

const buildMessage = (idx, picRow, hasNextPrev, numEnabled) => {
  const prevButton = new ButtonBuilder()
    .setCustomId(`prev:${idx}`)
    .setDisabled(!hasNextPrev)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("prev");
  const nextButton = new ButtonBuilder()
    .setCustomId(`next:${idx}`)
    .setDisabled(!hasNextPrev)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("next");
  const disableButton = new ButtonBuilder()
    .setCustomId(`disable:${idx}`)
    .setDisabled(!Boolean(picRow.enabled))
    .setStyle(ButtonStyle.Danger)
    .setLabel("disable");
  const enableButton = new ButtonBuilder()
    .setCustomId(`enable:${idx}`)
    .setDisabled(Boolean(picRow.enabled) || numEnabled >= MAX_ENABLED_PER_USER)
    .setStyle(ButtonStyle.Success)
    .setLabel("enable");

  const row = new ActionRowBuilder().addComponents(
    prevButton,
    disableButton,
    enableButton,
    nextButton
  );

  return row;
};

const buildEmbed = (picRow, picRows, idx, numEnabled) => {
  const embed = new EmbedBuilder()
    .setTitle(`Your Image (${picRow.enabled ? "Enabled" : "Disabled"})`)
    .setFooter({
      text: `Image ${idx + 1}/${picRows.length} [${numEnabled}/${MAX_ENABLED_PER_USER} enabled]`,

    })
    .setTimestamp(picRow.created_at * 1000)
    .setImage(`attachment://image-${picRow.id}.png`)
    .addFields([
      {
        name: 'Filename',
        value: picRow.filename,
        inline: true
      },
      {
        name: 'Times Posted',
        value: `${picRow.times_posted} time(s)`,
        inline: true
      }
    ])
    
  return embed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manage-images")
    .setDescription("Manage your own images (enable/disable)")
    .setDefaultMemberPermissions(PermissionFlagsBits.EmbedLinks)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.user;
    const userId = user.id;

    await interaction.deferReply({
      ephemeral: true,
    });

    const picRows = await findAllPicsByUser(interaction.client.db, userId);

    if (picRows.length === 0) {
      return interaction.editReply({
        content: "You do not have any pictures uploaded.",
      });
    }

    const picRow = picRows[0];
    const numEnabled = picRows.filter((pr) => pr.enabled).length;


    const attachment = attachmentBuilder(picRow);

    const embed = buildEmbed(picRow, picRows, 0, numEnabled);

    const row = buildMessage(0, picRow, picRows.length > 1, numEnabled);

    const response = await interaction.editReply({
      files: [attachment],
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    try {
      const confirmation = await response.awaitMessageComponent({
        time: 60000,
      });

      return this.buttonClick(confirmation);
    } catch (e) {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  },

  /**
   * @param {ButtonInteraction<CacheType>} confirmation
   */
  async buttonClick(confirmation) {
    let [action, idx] = confirmation.customId.split(":");
    idx = Number(idx);
    const user = confirmation.user;
    const userId = user.id;

    const reply = await confirmation.deferUpdate({});
    reply.edit({});
    let dbEnabledOverride = undefined;

    switch (action) {
      case "prev":
        idx -= 1;
        break;
      case "next":
        idx += 1;
        break;
      case "disable":
        dbEnabledOverride = false;
        break;
      case "enable":
        dbEnabledOverride = true;
        break;
      default:
        return reply.update({
          content: `We don't know what went wrong, but something happened`,
          components: [],
        });
    }

    const picRows = await findAllPicsByUser(confirmation.client.db, userId);

    if(idx === -1) { // let people click prev to loop backwards
      idx = picRows.length - 1
    } else if (idx === picRows.length) {
      idx = 0;
    }

    const picRow = picRows[idx];

    if (dbEnabledOverride !== undefined) {
      await setEnabledStatusForPic(
        confirmation.client.db,
        picRow.id,
        dbEnabledOverride
      );
      picRow.enabled = dbEnabledOverride;
    }

    const numEnabled = picRows.filter((pr) => pr.enabled).length;


    const attachment = attachmentBuilder(picRow);

    const embed = buildEmbed(picRow, picRows, idx, numEnabled);

    const row = buildMessage(idx, picRow, picRows.length > 1, numEnabled);


    const response = await reply.edit({
      files: [attachment],
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    try {
      const confirmation = await response.awaitMessageComponent({
        time: 60000,
      });

      return this.buttonClick(confirmation);
    } catch (e) {
      await confirmation.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  },
};
